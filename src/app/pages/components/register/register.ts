import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserRole } from '../../../model/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  registerForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    wing: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['supervisor' as UserRole, Validators.required],
  });

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) return;

    const { name, email, wing, password, role } = this.registerForm.value;
    try {
      await this.authService.register(
        email!,
        password!,
        name!,
        wing!,
        role as UserRole
      );
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Registration error:', error);
    }
  }
}

