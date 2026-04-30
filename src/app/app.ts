
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from './services/data.service';
import { SearchComponent } from './pages/components/search/serach';
import { AdminComponent } from './pages/components/admin/admin';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SearchComponent, AdminComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  data = inject(DataService);
  view = signal<'search' | 'admin'>('search');

  totalVehicles = computed(() =>
    this.data.residents().reduce((acc, r) => acc + r.vehicles.length, 0),
  );

  ngOnInit() {
    this.data.load();
  }

  setView(v: 'search' | 'admin') { this.view.set(v); }
}