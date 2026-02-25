import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Resolves an image URL from the backend.
 * If the URL is a relative path (e.g. /uploads/...), it prefixes it with
 * the API base URL so the browser fetches from the correct origin.
 * If it's already an absolute URL (http/https), it's returned as-is.
 */
export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path — prefix with backend URL
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
