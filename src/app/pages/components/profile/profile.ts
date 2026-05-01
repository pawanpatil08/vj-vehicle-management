import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../model/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  editingUser = signal<User | null>(null);

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      this.loading.set(true);
      const allUsers = await this.authService.getAllUsers();
      this.users.set(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.loading.set(false);
    }
  }

  get user() {
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

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  startEdit(user: User) {
    this.editingUser.set({ ...user });
  }

  cancelEdit() {
    this.editingUser.set(null);
  }

  async saveUser() {
    const user = this.editingUser();
    if (!user) return;

    try {
      await this.authService.updateUser(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        wing: user.wing,
      });
      await this.loadUsers();
      this.editingUser.set(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async deleteUser(user: User) {
    if (!confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
      return;
    }

    try {
      await this.authService.deleteUser(user.id);
      await this.loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }

  updateEditingUser(field: keyof User, value: any) {
    const user = this.editingUser();
    if (user) {
      this.editingUser.set({ ...user, [field]: value });
    }
  }
}
