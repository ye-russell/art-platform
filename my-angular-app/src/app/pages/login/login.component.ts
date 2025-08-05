import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit {
  @ViewChild('codeInput') codeInput!: ElementRef<HTMLInputElement>;
  
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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['', [Validators.required, Validators.maxLength(50)]],
    });
    // Confirmation form with pattern validation for 6-digit code
    this.confirmationForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    });
  }

  ngAfterViewInit(): void {
    // Focus management for accessibility
    if (this.showConfirmation && this.codeInput) {
      setTimeout(() => this.codeInput.nativeElement.focus(), 100);
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.showConfirmation = false;
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
      this.errorMessage = '';
      const { email, password, name } = this.registerForm.value;

      this.authService.signUp(email, password, name).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (!result.isSignUpComplete) {
            this.userEmail = email;
            this.showConfirmation = true;
            this.errorMessage = '';
            // Focus the confirmation input after view update
            setTimeout(() => {
              if (this.codeInput) {
                this.codeInput.nativeElement.focus();
              }
            }, 100);
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          this.errorMessage = error?.message || 'Registration failed. Please try again.';
        },
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private handleConfirmation(): void {
    if (this.confirmationForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { code } = this.confirmationForm.value;

      this.authService.confirmSignUp(this.userEmail, code).subscribe({
        next: () => {
          this.isLoading = false;
          this.showConfirmation = false;
          this.isRegisterMode = false; // Switch to login view
          this.errorMessage = '';
          // Success message can be handled by a snackbar or similar
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Verification failed. Please try again.';
        },
      });
    } else {
      this.markFormGroupTouched(this.confirmationForm);
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
          this.errorMessage = error.message || 'Sign in failed. Please check your credentials.';
        },
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  resendCode(): void {
    if (this.userEmail) {
      this.isLoading = true;
      this.authService.resendConfirmationCode(this.userEmail).subscribe({
        next: () => {
          this.isLoading = false;
          this.errorMessage = '';
          // Could show success message via snackbar
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Failed to resend verification code';
        },
      });
    }
  }

  // Accessibility helper methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
