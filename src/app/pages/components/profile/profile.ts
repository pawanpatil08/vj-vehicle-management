import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  get user() {
    console.log(this.authService.authState().user);
    return this.authService.authState().user;
  }

  get avatarLetter(): string {
    const user = this.user;
    if (!user) return 'U';
    return user.name?.trim().charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
