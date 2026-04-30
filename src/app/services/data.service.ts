
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Resident, VehicleEntry, Member } from './../model/resident.model';
import { computed, Injectable, signal } from '@angular/core';

/**
 * Robust CSV line splitter that respects quoted commas.
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '\"') {
      if (inQuotes && line[i + 1] === '\"') { cur += '\"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

function rowToResident(row: Record<string, string>, idx: number): Resident {
  const members: Member[] = [];
  for (let i = 1; i <= 6; i++) {
    const name = (row[`mName${i}`] ?? '').trim();
    const age = (row[`mAge${i}`] ?? '').trim();
    if (name) members.push({ name, age });
  }
  const vehicles: VehicleEntry[] = [];
  for (let i = 1; i <= 6; i++) {
    const owner = (row[`vOwner${i}`] ?? '').trim();
    const reg = (row[`vReg${i}`] ?? '').trim();
    const type = (row[`vType${i}`] ?? '').trim();
    if (reg) vehicles.push({ owner, reg, type });
  }
  const all = Object.values(row).join(' | ').toLowerCase();
  return {
    id: `R-${idx + 1}`,
    flatNumber: (row['flatNumber'] ?? '').trim(),
    occupiedBy: (row['occupiedBy'] ?? '').trim(),
    moveInDate: (row['moveInDate'] ?? '').trim(),
    myGateReg: (row['myGateReg'] ?? '').trim(),
    primaryName: (row['mgName1'] ?? '').trim(),
    primaryMobile: (row['mgMobile1'] ?? '').trim(),
    secondaryName: (row['mgName2'] ?? '').trim(),
    secondaryMobile: (row['mgMobile2'] ?? '').trim(),
    totalMembers: (row['totalMembers'] ?? '').trim(),
    members,
    vTotal2W: (row['vTotal2W'] ?? '').trim(),
    vTotal4W: (row['vTotal4W'] ?? '').trim(),
    vehicles,
    anyPets: (row['anyPets'] ?? '').trim(),
    petType1: (row['petType1'] ?? '').trim(),
    petType2: (row['petType2'] ?? '').trim(),
    dateInserted: (row['dateInserted'] ?? '').trim(),
    _all: all,
  };
}

function normalizeReg(s: string): string {
  return s.toLowerCase().replace(/[\s\-]/g, '');
}

@Injectable({ providedIn: 'root' })
export class DataService {
  // The single in-memory JSON variable holding all parsed residents
  readonly residents = signal<Resident[]>([]);
  readonly query = signal<string>('');
  readonly loading = signal<boolean>(true);
  readonly error = signal<string>('');

  // Admin auth state
  readonly isAdmin = signal<boolean>(false);
  readonly ADMIN_PASSWORD = 'admin123';

  readonly searchKind = computed<'flat' | 'mobile' | 'vehicle' | 'name' | 'idle'>(() => {
    const q = this.query().trim();
    if (!q) return 'idle';
    if (/^\+?\d[\d\s-]{6,}$/.test(q)) return 'mobile';
    if (/^a-?\s?\d{2,5}$/i.test(q.replace(/\s/g, ''))) return 'flat';
    if (/^[a-z]{2}[\s-]?\d{1,2}[\s-]?[a-z]{1,3}[\s-]?\d{1,4}$/i.test(q)) return 'vehicle';
    if (/^\d+$/.test(q)) return 'mobile';
    return 'name';
  });

  readonly results = computed<Resident[]>(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.residents();
    if (!q) return list;
    const qNorm = normalizeReg(q);
    return list.filter((r) => {
      if (r._all.includes(q)) return true;
      // also check normalized vehicle reg
      for (const v of r.vehicles) {
        if (normalizeReg(v.reg).includes(qNorm)) return true;
      }
      return normalizeReg(r.flatNumber).includes(qNorm);
    });
  });

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    try {
      this.loading.set(true);
      const text = await firstValueFrom(
        this.http.get('residents.csv', { responseType: 'text' })
      );
      const rows = parseCsv(text);
      const data = rows.map(rowToResident).filter((r) => r.flatNumber);
      this.residents.set(data);
      this.error.set('');
    } catch (e: any) {
      this.error.set('Failed to load resident data');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  setQuery(v: string) { this.query.set(v); }

  // Admin operations (require isAdmin)
  login(password: string): boolean {
    if (password === this.ADMIN_PASSWORD) {
      this.isAdmin.set(true);
      return true;
    }
    return false;
  }
  logout() { this.isAdmin.set(false); }

  addResident(r: Omit<Resident, 'id' | '_all'>): Resident {
    const id = `R-${Date.now()}`;
    const all = Object.values(r).flatMap((v) =>
      Array.isArray(v) ? v.map((x: any) => Object.values(x).join(' ')) : [String(v)]
    ).join(' | ').toLowerCase();
    const full: Resident = { ...r, id, _all: all };
    this.residents.update((list) => [full, ...list]);
    return full;
  }

  updateResident(id: string, patch: Partial<Resident>) {
    this.residents.update((list) =>
      list.map((r) => {
        if (r.id !== id) return r;
        const merged: Resident = { ...r, ...patch };
        merged._all = [
          merged.flatNumber, merged.occupiedBy, merged.primaryName, merged.primaryMobile,
          merged.secondaryName, merged.secondaryMobile,
          ...merged.vehicles.map((v) => `${v.owner} ${v.reg} ${v.type}`),
          ...merged.members.map((m) => `${m.name} ${m.age}`),
        ].join(' | ').toLowerCase();
        return merged;
      })
    );
  }

  deleteResident(id: string) {
    this.residents.update((list) => list.filter((r) => r.id !== id));
  }
}
