const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export const API_BASE_URL = publicApiUrl || '/api';
export const API_ORIGIN = publicApiUrl ? publicApiUrl.replace(/\/api$/, '') : '';

export function toAssetUrl(path?: string | null) {
  if (!path) {
    return '';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${path}`;
}
