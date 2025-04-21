import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ArtistComponent } from './pages/artist/artist.component';
import { SubmitComponent } from './pages/submit/submit.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'artist/:id', component: ArtistComponent },
  { path: 'submit', component: SubmitComponent },
  { path: '**', redirectTo: '' },
];
