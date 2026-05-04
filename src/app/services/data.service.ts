
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Resident } from './../model/resident.model';
import { computed, Injectable, signal } from '@angular/core';

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
      const data = await firstValueFrom(
        this.http.get<Resident[]>('residents.json')
      );
      this.residents.set(Array.isArray(data) ? data : []);
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
