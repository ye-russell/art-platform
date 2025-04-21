import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Artist, Artwork } from '../shared/models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'https://api.example.com'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  // Fetch all artworks
  getArtworks(): Observable<Artwork[]> {
    return this.http.get<Artwork[]>(`${this.baseUrl}/api/artworks`);
  }

  // Fetch a single artwork by ID
  getArtworkById(id: string): Observable<Artwork> {
    return this.http.get<Artwork>(`${this.baseUrl}/api/artworks/${id}`);
  }

  // Add a new artwork
  addArtwork(artwork: FormData): Observable<Artwork> {
    return this.http.post<Artwork>(`${this.baseUrl}/api/artworks`, artwork);
  }

  // Fetch all artists
  getArtists(): Observable<any[]> {
    return this.http.get<Artist[]>(`${this.baseUrl}/api/artists`);
  }

  // Add a new artist
  addArtist(artist: any): Observable<any> {
    return this.http.post<Artist>(`${this.baseUrl}/api/artists`, artist);
  }
}
