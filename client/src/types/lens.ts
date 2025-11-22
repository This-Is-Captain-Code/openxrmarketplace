export interface Lens {
  id: string;
  name: string;
  displayName: string;
  coverImage: string;
  iconUrl?: string;
  groupId?: string;
  price: number; // Price in XRT tokens
}
