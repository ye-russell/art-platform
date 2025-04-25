import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { ArtistComponent } from './pages/artist/artist.component';
import { SubmitComponent } from './pages/submit/submit.component';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'artist/:id', component: ArtistComponent },
  { path: 'submit', component: SubmitComponent },
  { path: '**', redirectTo: '' },
];
