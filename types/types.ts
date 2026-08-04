export type LinkData = {
  slug: string;
  link: string;
  accessCode: string;
  recipientEmail: string;
  date: string;
  clicks: number;
  createdAt: string;
  name?: string;
  phone?: string;
};

export interface User {
  id: string;
  email: string;
  name?: string;
  access_token: string;
  refresh_token: string;
  token_expiry?: number;
}
