import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Artwork } from '../../shared/models';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-submit',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css',
  standalone: true,
})
export class SubmitComponent implements OnInit {
  submitForm!: FormGroup;
  isLoading = false;
  submitError = '';
  selectedFileName = '';
  imagePreview = '';

  // File validation constants
  private readonly allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(
    private fb: FormBuilder, 
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.submitForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      image: [null, Validators.required],
      externalLink: ['', [Validators.pattern('^https?://.+\\..+')]],
      artistInfo: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  onSubmit(): void {
    if (this.submitForm.valid) {
      this.isLoading = true;
      this.submitError = '';
      
      const artwork: Artwork = this.submitForm.value;
      console.log('Submitting artwork:', artwork);
      
      this.apiService.addArtwork(artwork).subscribe({
        next: (response) => {
          console.log('Artwork submitted successfully:', response);
          this.isLoading = false;
          
          // Show success message
          this.snackBar.open('Artwork submitted successfully! 🎨', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Reset the form and clear preview
          this.resetForm();
          
          // Navigate to gallery after a short delay
          setTimeout(() => {
            this.router.navigate(['/gallery']);
          }, 1500);
        },
        error: (error: Error) => {
          console.error('Error submitting artwork:', error);
          this.isLoading = false;
          this.submitError = error.message || 'Failed to submit artwork. Please try again.';
          
          // Show error message
          this.snackBar.open('Failed to submit artwork. Please try again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.submitForm);
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    
    if (file) {
      // Clear previous errors
      this.submitError = '';
      
      // Validate file type
      if (!this.allowedTypes.includes(file.type)) {
        this.submitForm.get('image')?.setErrors({ invalidType: true });
        return;
      }
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.submitForm.get('image')?.setErrors({ fileTooLarge: true });
        return;
      }
      
      // Store filename for display
      this.selectedFileName = file.name;
      
      // Convert file to base64 and create preview
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        
        // Create preview URL
        this.imagePreview = base64String;
        
        // Store image data in form
        const imageData = {
          data: base64String,
          type: file.type,
          name: file.name,
          size: file.size
        };
        
        this.submitForm.patchValue({ image: imageData });
        this.submitForm.get('image')?.setErrors(null);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFileName = '';
    this.imagePreview = '';
    this.submitForm.patchValue({ image: null });
    
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private resetForm(): void {
    this.submitForm.reset();
    this.selectedFileName = '';
    this.imagePreview = '';
    this.submitError = '';
    
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}