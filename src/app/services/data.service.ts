
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FirebaseDataService } from './firebase-data.service';
import { Resident } from './../model/resident.model';
import { computed, Injectable, signal, inject } from '@angular/core';

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

  private firebaseData = inject(FirebaseDataService);
  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    try {
      this.loading.set(true);
      console.log('[DataService] load() fetching residents from Firestore...');
      const data = await this.firebaseData.getResidents();
      console.log('[DataService] load() fetched residents:', data.length);
      // Compute _all client-side
      const fullData = data.map(r => ({
        ...r,
        _all: [
          r.flatNumber, r.occupiedBy, r.primaryName, r.primaryMobile,
          r.secondaryName || '', r.secondaryMobile || '',
          ...(r.vehicles || []).map(v => `${v.owner} ${v.reg} ${v.type}`),
          ...(r.members || []).map(m => `${m.name} ${m.age}`),
        ].join(' | ').toLowerCase()
      }));
      this.residents.set(fullData);
      this.error.set('');
    } catch (e: any) {
      this.error.set('Failed to load resident data from Firebase');
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

  async addResident(r: Omit<Resident, 'id' | '_all'>): Promise<Resident> {
    await this.firebaseData.addResident({ ...r, vehicles: r.vehicles || [], members: r.members || [] } as any);
    await this.load(); // Refresh
    return { id: '', ...r, _all: '' } as Resident;
  }

  async updateResident(id: string, patch: Partial<Resident>): Promise<void> {
    await this.firebaseData.updateResident(id, patch);
    await this.load(); // Refresh
  }

  async deleteResident(id: string): Promise<void> {
    await this.firebaseData.deleteResident(id);
    await this.load(); // Refresh
  }
}
