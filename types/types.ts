export type LinkData = {
  slug: string;
  link: string;
  date: string;
  clicks: number;
  createdAt: string;
  name?: string;
  phone?: string;
  location?: string;
  cropType?: string;
  farmSize?: string;
};

export interface User {
  id: string;
  email: string;
  name?: string;
  access_token: string;
  refresh_token: string;
  token_expiry?: number;
}
