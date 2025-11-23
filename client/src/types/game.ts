export interface Game {
  id: string;
  name: string;
  displayName: string;
  coverImage: string;
  price: number;
  url: string;
  isMobileOnly: boolean;
  description?: string;
}
