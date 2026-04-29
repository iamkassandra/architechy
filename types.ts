
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledTime?: string;
}

export interface DigitalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  fileUrl: string;
  category: string;
}

export interface UserDraft {
  id: string;
  rawText: string;
  targetDate: string;
  targetTime: string;
  platform: 'blog' | 'twitter' | 'linkedin' | 'all';
  status: 'pending' | 'refined' | 'live';
}

export interface OrchestrationLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'processing' | 'error';
  platform: string;
}

export interface UserProfile {
  email: string;
  subscribed: boolean;
  purchasedAssetIds: string[];
}

export const AppRoute = {
  HOME: '/',
  BLOG: '/blog',
  SHOP: '/shop',
  CHECKOUT: '/checkout',
  HUB: '/hub', 
  SUCCESS: '/success',
  ACCOUNT: '/account',
  ADMIN: '/admin'
} as const;

export type AppRoute = typeof AppRoute[keyof typeof AppRoute];
