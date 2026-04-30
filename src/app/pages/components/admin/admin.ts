
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { Resident, VehicleEntry, Member } from '../../../model/resident.model';

interface AdminFormState {
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

const emptyForm = (): AdminFormState => ({
  flatNumber: '',
  occupiedBy: 'Owner',
  primaryName: '',
  primaryMobile: '',
  secondaryName: '',
  secondaryMobile: '',
  totalMembers: '',
  vTotal2W: '',
  vTotal4W: '',
  vehicles: [{ owner: '', reg: '', type: '4-Wheeler' }],
  members: [{ name: '', age: '' }],
  anyPets: 'NO',
});

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent {
  data = inject(DataService);

  readonly password = signal<string>('');
  readonly loginError = signal<string>('');
  readonly editingId = signal<string | null>(null);
  readonly showForm = signal<boolean>(false);
  readonly form = signal<AdminFormState>(emptyForm());
  readonly filter = signal<string>('');
  readonly toast = signal<string>('');

  readonly filteredList = computed<Resident[]>(() => {
    const f = this.filter().trim().toLowerCase();
    const list = this.data.residents();
    if (!f) return list;
    return list.filter((r) => r._all.includes(f));
  });

  attemptLogin() {
    const ok = this.data.login(this.password());
    if (!ok) {
      this.loginError.set('Incorrect password');
      setTimeout(() => this.loginError.set(''), 2500);
    } else {
      this.loginError.set('');
      this.password.set('');
    }
  }

  logout() { this.data.logout(); }

  startNew() {
    this.editingId.set(null);
    this.form.set(emptyForm());
    this.showForm.set(true);
  }

  startEdit(r: Resident) {
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
      vehicles: r.vehicles.length ? [...r.vehicles] : [{ owner: '', reg: '', type: '4-Wheeler' }],
      members: r.members.length ? [...r.members] : [{ name: '', age: '' }],
      anyPets: r.anyPets || 'NO',
    });
    this.showForm.set(true);
  }

  cancelForm() {
    this.showForm.set(false);
    this.editingId.set(null);
  }

  addVehicleRow() {
    this.form.update((f) => ({ ...f, vehicles: [...f.vehicles, { owner: '', reg: '', type: '4-Wheeler' }] }));
  }
  removeVehicleRow(idx: number) {
    this.form.update((f) => ({ ...f, vehicles: f.vehicles.filter((_, i) => i !== idx) }));
  }
  addMemberRow() {
    this.form.update((f) => ({ ...f, members: [...f.members, { name: '', age: '' }] }));
  }
  removeMemberRow(idx: number) {
    this.form.update((f) => ({ ...f, members: f.members.filter((_, i) => i !== idx) }));
  }

  // Two-way helpers for nested rows
  updateField<K extends keyof AdminFormState>(k: K, v: AdminFormState[K]) {
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
    const cleaned = {
      flatNumber: f.flatNumber.trim(),
      occupiedBy: f.occupiedBy,
      moveInDate: '',
      myGateReg: 'YES',
      primaryName: f.primaryName.trim(),
      primaryMobile: f.primaryMobile.trim(),
      secondaryName: f.secondaryName.trim(),
      secondaryMobile: f.secondaryMobile.trim(),
      totalMembers: f.totalMembers.trim(),
      members: f.members.filter((m) => m.name.trim()),
      vTotal2W: f.vTotal2W.trim(),
      vTotal4W: f.vTotal4W.trim(),
      vehicles: f.vehicles.filter((v) => v.reg.trim()),
      anyPets: f.anyPets,
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
    this.showForm.set(false);
    this.editingId.set(null);
  }

  delete(r: Resident) {
    if (!confirm(`Delete entry for ${r.flatNumber}?`)) return;
    this.data.deleteResident(r.id);
    this.flashToast(`Deleted ${r.flatNumber}`);
  }

  flashToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2200);
  }
}
