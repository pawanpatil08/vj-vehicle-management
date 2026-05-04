import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  user = computed(() => this.authService.getCurrentUser());

  get avatarLetter(): string {
    const user = this.user();
    if (!user) return 'U';
    return user.name?.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  get isDataManager(): boolean {
    return this.authService.hasRole('datamanagement');
  }

  get isSupervisor(): boolean {
    return this.authService.hasRole('supervisor');
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }

  goToAdmin() {
    this.router.navigate(['/data-management']);
  }

  goToDataManagement() {
    this.router.navigate(['/data-management']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
