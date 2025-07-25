import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Artist, Artwork } from '../shared/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl; // Ends with /prod/
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  // Helper method to construct proper URLs
  private getApiUrl(endpoint: string): string {
    // baseUrl already includes /prod/, just append api/ + endpoint
    return `${this.baseUrl}api/${endpoint}`;
  }

  // Artworks endpoints
  getArtworks(): Observable<Artwork[]> {
    return this.http.get<Artwork[]>(this.getApiUrl('artworks'))
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getArtworkById(id: string): Observable<Artwork> {
    return this.http.get<Artwork>(this.getApiUrl(`artworks/${id}`))
      .pipe(
        catchError(this.handleError)
      );
  }

  addArtwork(artwork: Artwork): Observable<Artwork> {
    return this.http.post<Artwork>(this.getApiUrl('artworks'), artwork)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateArtwork(id: string, artwork: Partial<Artwork>): Observable<Artwork> {
    return this.http.put<Artwork>(this.getApiUrl(`artworks/${id}`), artwork)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteArtwork(id: string): Observable<void> {
    return this.http.delete<void>(this.getApiUrl(`artworks/${id}`))
      .pipe(
        catchError(this.handleError)
      );
  }

  // Artists endpoints
  getArtists(): Observable<Artist[]> {
    return this.http.get<Artist[]>(this.getApiUrl('artists'))
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  addArtist(artist: Artist): Observable<Artist> {
    return this.http.post<Artist>(this.getApiUrl('artists'), artist)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}