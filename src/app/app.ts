
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { LoadingService } from './services/loading.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,   RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App  {
  data = inject(DataService);
  authService = inject(AuthService);
  router = inject(Router);
  loadingService = inject(LoadingService);
  view = signal<'search' | 'admin'>('search');

  setView(v: 'search' | 'admin') { this.view.set(v); }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  get avatarInitial(): string {
    const user = this.getCurrentUser();
    const name = user?.name?.trim();
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
