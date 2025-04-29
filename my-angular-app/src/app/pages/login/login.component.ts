import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isRegisterMode = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.isRegisterMode) {
      if (this.registerForm.valid) {
        this.isLoading = true;
        const { email, password, name } = this.registerForm.value;

        this.authService.signUp(email, password, name).subscribe({
          next: () => {
            this.isLoading = false;
            this.toggleMode(); // Switch back to login mode after successful registration
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.message || 'Registration failed';
          },
        });
      }
    } else {
      if (this.loginForm.valid) {
        this.isLoading = true;
        this.errorMessage = '';

        const { email, password } = this.loginForm.value;

        this.authService.signIn(email, password).subscribe({
          next: () => {
            this.router.navigate(['/gallery']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = error.message || 'Login failed';
          },
        });
      }
    }
  }
}
