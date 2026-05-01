

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { AuthService } from '../../../services/auth.service';
import { Resident } from '../../../model/resident.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchComponent {
  data = inject(DataService);
  authService = inject(AuthService);
  expanded = signal<Set<string>>(new Set());


 totalVehicles = computed(() =>
    this.data.residents().reduce((acc, r) => acc + r.vehicles.length, 0),
  );

  
  onInput(value: string) {
    this.data.setQuery(value);
  }

  clear() {
    this.data.setQuery('');
  }

  toggle(id: string) {
    const next = new Set(this.expanded());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.expanded.set(next);
  }

  isOpen(id: string): boolean {
    return this.expanded().has(id);
  }

  highlight(value: string): string {
    const q = this.data.query().trim();
    if (!q || !value) return value;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return value.replace(new RegExp(safe, 'gi'), (m) => `<mark>${m}</mark>`);
  }

  canEdit(): boolean {
    return this.authService.canEdit();
  }

  trackById = (_: number, r: Resident) => r.id;
}
