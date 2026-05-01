import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

//   constructor() {
//     // Redirect if already authenticated
//     effect(() => {
//       if (this.authService.isAuthenticated()) {
//         this.router.navigate(['/search']);
//       }
//     });
//   }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email!, password!);
      
      // Wait a brief moment for the auth state listener to update with user profile
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
