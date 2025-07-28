import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Artwork } from '../../shared/models';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
  imports: [MatCardModule],
})

export class GalleryComponent implements OnInit {
  artworks: Artwork[] = [];
  errorMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadArtworks();
  }

  private loadArtworks(): void {
    this.apiService.getArtworks().subscribe({
      next: (data: Artwork[]) => {
        console.log('Loaded artworks:', data); // Log the loaded artworks for debugging
        this.artworks = data;
      },
      error: (error: Error) => {
        this.errorMessage = error.message || 'Failed to load artworks';
      },
    });
  }
}