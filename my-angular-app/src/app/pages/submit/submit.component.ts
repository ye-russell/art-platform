import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Artwork } from '../../shared/models';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-submit',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css',
  standalone: true,
})
export class SubmitComponent implements OnInit {
  submitForm!: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private apiService: ApiService) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.submitForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      image: [null, Validators.required],
      externalLink: [
        '',
        [Validators.required, Validators.pattern('https?://.+')],
      ],
      artistInfo: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  onSubmit(): void {
    if (this.submitForm.valid) {
      this.isLoading = true;
      const artwork: Artwork = this.submitForm.value;
      console.log('Submitting artwork:', artwork); // Log the artwork for debugging
      this.apiService.addArtwork(artwork).subscribe({
        next: () => {
          this.isLoading = false;
          this.submitForm.reset();
        },
        error: (error: Error) => {
          this.isLoading = false;
          console.error('Error submitting artwork:', error);
        },
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Selected file:', file); // Log the file for debugging
      // Store the file in a separate variable or process it as needed
      this.submitForm.patchValue({ image: file }); // Store the file object in the form
    }
  }
}