
import { UserProfile, BlogPost, DigitalProduct } from '../types';

const STORAGE_KEY = 'ARCHITECH_USER_DB';
const BLOG_KEY = 'ARCHITECH_BLOG_DB';
const VAULT_KEY = 'ARCHITECH_VAULT_DB';
const ADMIN_AUTH_KEY = 'ARCHITECH_ADMIN_AUTH';

export const getUser = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const getBlogPosts = (): BlogPost[] => {
  const data = localStorage.getItem(BLOG_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveBlogPost = (post: BlogPost) => {
  const posts = getBlogPosts();
  localStorage.setItem(BLOG_KEY, JSON.stringify([post, ...posts]));
};

export const getVaultAssets = (): DigitalProduct[] => {
  const data = localStorage.getItem(VAULT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveVaultAsset = (asset: DigitalProduct) => {
  const assets = getVaultAssets();
  localStorage.setItem(VAULT_KEY, JSON.stringify([asset, ...assets]));
};

export const subscribeEmail = (email: string) => {
  const current = getUser();
  if (current && current.email === email) {
    saveUser({ ...current, subscribed: true });
  } else {
    saveUser({ email, subscribed: true, purchasedAssetIds: [] });
  }
};

export const recordPurchase = (assetId: string, email?: string) => {
  const current = getUser();
  const effectiveEmail = email || current?.email || 'guest@architech.com';
  
  const updatedPurchases = current?.email === effectiveEmail 
    ? Array.from(new Set([...(current?.purchasedAssetIds || []), assetId]))
    : [assetId];

  saveUser({
    email: effectiveEmail,
    subscribed: current?.subscribed || false,
    purchasedAssetIds: updatedPurchases
  });
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const setAdminAuth = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
};

export const isAdminAuthenticated = (): boolean => {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};
