export interface Artwork {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  artist: Artist;
  createdAt?: Date;
}

export interface Artist {
  id?: string;
  name: string;
  bio?: string;
  website?: string;
  contactEmail?: string;
  profileImageUrl?: string;
}
