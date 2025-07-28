export interface Artwork {
  id?: string;
  title: string;
  description: string;
  price?: Price;
  imageUrl: string;
  link: string;
  externalLink?: string;
  source?: string;
  artist: Artist;
  artistInfo: string;
  createdAt?: Date;
}

export interface Artist {
  id?: string;
  name: string;
  bio?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  profileImageUrl?: string;
}

interface Price {
  amount: number;
  currency: string;
}