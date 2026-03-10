import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Builds a full image URL from a folder and filename.
 * The backend now stores only filenames (e.g. "a0eebc99.webp").
 * This function constructs the complete URL for rendering.
 * If the value is already a full URL (legacy data), it's returned as-is.
 */
export function buildImageUrl(folder: string, filename: string | null | undefined): string | undefined {
  if (!filename) return undefined;
  if (filename.startsWith('http')) return filename; // backwards compat with old full URLs
  return `${API_BASE_URL}/uploads/${folder}/${filename}`;
}
