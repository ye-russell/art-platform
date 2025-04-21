import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Artwork } from '../../shared/models';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
  imports: [MatCardModule]
})
export class GalleryComponent {
  artList: Artwork[] = [
    {
      id: '1',
      title: 'Starry Night',
      description: 'A famous painting by Vincent van Gogh.',
      imageUrl: 'https://picsum.photos/800/600',
      artist: {name: 'Vincent van Gogh'},
      link: 'https://example.com/starry-night'
    },
    {
      id: '2',
      title: 'Mona Lisa',
      description: 'A portrait painting by Leonardo da Vinci.',
      imageUrl: 'https://picsum.photos/800/600',
      artist: {name:'Leonardo da Vinci'},
      link: 'https://example.com/mona-lisa'
    }
  ];}
