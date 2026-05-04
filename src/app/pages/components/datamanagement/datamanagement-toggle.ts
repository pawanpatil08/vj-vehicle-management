import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { Member, Resident, VehicleEntry } from '../../../model/resident.model';

interface DataManagementFormState {
  flatNumber: string;
  occupiedBy: string;
  primaryName: string;
  primaryMobile: string;
  secondaryName: string;
  secondaryMobile: string;
  totalMembers: string;
  vTotal2W: string;
  vTotal4W: string;
  vehicles: VehicleEntry[];
  members: Member[];
  anyPets: string;
}

const emptyForm = (): DataManagementFormState => ({
  flatNumber: '',
  occupiedBy: 'Owner',
  primaryName: '',
  primaryMobile: '',
  secondaryName: '',
  secondaryMobile: '',
  totalMembers: '',
  vTotal2W: '',
  vTotal4W: '',
  vehicles: Array.from({ length: 6 }, () => ({ owner: '', reg: '', type: '4-Wheeler' })),
  members: Array.from({ length: 6 }, () => ({ name: '', age: '' })),
  anyPets: 'NO',
});

@Component({
  selector: 'app-data-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datamanagement.html',
  styleUrl: './datamanagement.scss',
})
export class DataManagementComponent {
  data = inject(DataService);
  router = inject(Router);

  readonly expanded = signal<Set<string>>(new Set());  // New toggle state like search
  readonly editingId = signal<string | null>(null);
  readonly showModal = signal<boolean>(false);
  readonly form = signal<DataManagementFormState>(emptyForm());
  readonly filter = signal<string>('');
  readonly toast = signal<string>('');

  readonly filteredList = computed<Resident[]>(() => {
    const f = this.filter().trim().toLowerCase();
    const list = this.data.residents();
    if (!f) return list;
    return list.filter((r) => r._all.includes(f));
  });

  ngOnInit() {
    this.data.load();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Toggle open/close
  toggle(id: string) {
    const next = new Set(this.expanded());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.expanded.set(next);
  }

  isOpen(id: string): boolean {
    return this.expanded().has(id);
  }

  // Modal methods
  openNew() {
    this.editingId.set(null);
    this.form.set(emptyForm());
    this.showModal.set(true);
  }

  openEdit(r: Resident) {
    this.editingId.set(r.id);
    this.form.set({
      flatNumber: r.flatNumber,
      occupiedBy: r.occupiedBy || 'Owner',
      primaryName: r.primaryName,
      primaryMobile: r.primaryMobile,
      secondaryName: r.secondaryName,
      secondaryMobile: r.secondaryMobile,
      totalMembers: r.totalMembers,
      vTotal2W: r.vTotal2W,
      vTotal4W: r.vTotal4W,
      vehicles: normalizeVehicleRows(r.vehicles || []),
      members: normalizeMemberRows(r.members || []),
      anyPets: r.anyPets || 'NO',
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
    this.toast.set('');
  }

  updateField<K extends keyof DataManagementFormState>(k: K, v: DataManagementFormState[K]) {
    this.form.update((f) => ({ ...f, [k]: v }));
  }

  updateVehicle(idx: number, key: keyof VehicleEntry, v: string) {
    this.form.update((f) => ({
      ...f,
      vehicles: f.vehicles.map((row, i) => (i === idx ? { ...row, [key]: v } : row)),
    }));
  }

  updateMember(idx: number, key: keyof Member, v: string) {
    this.form.update((f) => ({
      ...f,
      members: f.members.map((row, i) => (i === idx ? { ...row, [key]: v } : row)),
    }));
  }

  save() {
    const f = this.form();
    if (!f.flatNumber.trim()) {
      this.flashToast('Flat number is required');
      return;
    }

    const cleanedMembers = f.members.filter((m) => m.name.trim()).map((m) => ({ name: m.name.trim(), age: m.age.trim() }));

    const cleanedVehicles = f.vehicles.filter((v) => v.reg.trim()).map((v) => ({
      owner: v.owner.trim(),
      reg: v.reg.trim(),
      type: v.type.trim(),
    }));

    const cleaned: Omit<Resident, 'id' | '_all'> = {
      flatNumber: f.flatNumber.trim(),
      occupiedBy: f.occupiedBy.trim(),
      moveInDate: '',
      myGateReg: 'YES',
      primaryName: f.primaryName.trim(),
      primaryMobile: f.primaryMobile.trim(),
      secondaryName: f.secondaryName.trim(),
      secondaryMobile: f.secondaryMobile.trim(),
      totalMembers: f.totalMembers.trim(),
      members: cleanedMembers,
      vTotal2W: f.vTotal2W.trim(),
      vTotal4W: f.vTotal4W.trim(),
      vehicles: cleanedVehicles,
      anyPets: f.anyPets.trim() || 'NO',
      petType1: '',
      petType2: '',
      dateInserted: new Date().toLocaleString(),
    };

    const id = this.editingId();
    if (id) {
      this.data.updateResident(id, cleaned);
      this.flashToast(`Updated ${cleaned.flatNumber}`);
    } else {
      this.data.addResident(cleaned);
      this.flashToast(`Added ${cleaned.flatNumber}`);
    }
    this.closeModal();
  }

  confirmDelete(r: Resident) {
    if (confirm(`Delete ${r.flatNumber}?`)) {
      this.data.deleteResident(r.id);
      this.flashToast(`Deleted ${r.flatNumber}`);
    }
  }

  confirmDeleteFromModal() {
    const id = this.editingId();
    if (!id) return;
    const flat = this.form().flatNumber;
    if (confirm(`Delete ${flat}?`)) {
      this.data.deleteResident(id);
      this.flashToast(`Deleted ${flat}`);
      this.closeModal();
    }
  }

  flashToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2200);
  }

  trackById(_: number, r: Resident) {
    return r.id;
  }
}

// Helpers
function normalizeMemberRows(members: Member[]): Member[] {
  const rows = Array.from({ length: 6 }, () => ({ name: '', age: '' }));
  (members || []).slice(0, 6).forEach((m, idx) => {
    rows[idx] = { name: m.name ?? '', age: m.age ?? '' };
  });
  return rows;
}

function normalizeVehicleRows(vehicles: VehicleEntry[]): VehicleEntry[] {
  const rows = Array.from({ length: 6 }, () => ({ owner: '', reg: '', type: '4-Wheeler' }));
  (vehicles || []).slice(0, 6).forEach((v, idx) => {
    rows[idx] = { owner: v.owner ?? '', reg: v.reg ?? '', type: v.type ?? '4-Wheeler' };
  });
  return rows;
}
