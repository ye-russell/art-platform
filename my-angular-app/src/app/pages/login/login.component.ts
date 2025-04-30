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
  confirmationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  isRegisterMode = false;
  needsConfirmation = false;
  showConfirmation = false; // To control confirmation code view
  userEmail = ''; // Store email for confirmation

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
    // Confirmation form
    this.confirmationForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.showConfirmation) {
      this.handleConfirmation();
    } else if (this.isRegisterMode) {
      this.handleRegistration();
    } else {
      this.handleLogin();
    }
  }

  private handleRegistration(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, password, name } = this.registerForm.value;

      this.authService.signUp(email, password, name).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (!result.isSignUpComplete) {
            this.userEmail = email;
            this.showConfirmation = true;
            this.errorMessage =
              'Please check your email for the confirmation code';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Registration failed';
        },
      });
    }
  }

  private handleConfirmation(): void {
    if (this.confirmationForm.valid) {
      this.isLoading = true;
      const { code } = this.confirmationForm.value;

      this.authService.confirmSignUp(this.userEmail, code).subscribe({
        next: () => {
          this.isLoading = false;
          this.showConfirmation = false;
          this.isRegisterMode = false; // Switch to login view
          this.errorMessage = 'Email confirmed successfully. Please login.';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Confirmation failed';
        },
      });
    }
  }

  private handleLogin(): void {
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

  resendCode(): void {
    if (this.userEmail) {
      this.isLoading = true;
      this.authService.resendConfirmationCode(this.userEmail).subscribe({
        next: () => {
          this.isLoading = false;
          this.errorMessage = 'New confirmation code sent to your email';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to resend code';
        },
      });
    }
  }
}
