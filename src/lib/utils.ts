import { type ClassValue, clsx } from "clsx";
import { mf2 } from 'microformats-parser';
import { twMerge } from "tailwind-merge";

export interface ClientMetadata {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  author?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fetches client metadata from the client_id URL
 * Parses microformats2 h-app data and falls back to meta tags
 */
export async function fetchClientMetadata(clientId: string): Promise<ClientMetadata> {
  const defaultMetadata: ClientMetadata = {
    name: extractNameFromUrl(clientId),
    url: clientId,
  };

  try {
    const response = await fetch(clientId, {
      headers: {
        'Accept': 'text/html,application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`Failed to fetch client metadata: ${response.status}`);
      return defaultMetadata;
    }

    const contentType = response.headers.get('content-type') || '';

    // Handle JSON metadata
    if (contentType.includes('application/json')) {
      const json = await response.json();
      return {
        name: json.name || json.client_name || defaultMetadata.name,
        url: json.url || json.client_uri || clientId,
        logo: json.logo || json.logo_uri,
        description: json.description,
        author: json.author || json.developer,
      };
    }

    // Parse HTML
    const html = await response.text();

    // Parse microformats2
    const mfData = mf2(html, { baseUrl: clientId });

    // Look for h-app or h-x-app
    const app = mfData.items?.find((item: any) =>
      item.type?.includes('h-app') || item.type?.includes('h-x-app')
    );

    if (app?.properties) {
      const props = app.properties;

      // Helper to extract string values from microformat properties
      const getString = (prop: any): string | undefined => {
        if (Array.isArray(prop) && prop.length > 0) {
          const first = prop[0];
          if (typeof first === 'string') return first;
          if (typeof first === 'object' && first.properties?.name?.[0]) {
            return first.properties.name[0];
          }
        }
        return undefined;
      };

      return {
        name: getString(props.name) || defaultMetadata.name,
        url: getString(props.url) || clientId,
        logo: getString(props.logo) || getString(props.photo),
        description: getString(props.summary) || getString(props.description),
        author: getString(props.author),
      };
    }

    // Fallback to meta tags if no microformats found
    const metaData = parseMetaTags(html);
    if (metaData) {
      return { ...defaultMetadata, ...metaData };
    }

    return defaultMetadata;
  } catch (error) {
    console.error('Error fetching client metadata:', error);
    return defaultMetadata;
  }
}

/**
 * Extract a reasonable app name from the URL
 */
function extractNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname.split('/').filter(Boolean)[0];

    if (path) {
      return path.charAt(0).toUpperCase() + path.slice(1);
    }

    const domainParts = hostname.split('.');
    const mainDomain = domainParts[domainParts.length - 2] || domainParts[0];
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  } catch {
    return 'Unknown Application';
  }
}

/**
 * Parse metadata from HTML meta tags as fallback
 */
function parseMetaTags(html: string): Partial<ClientMetadata> | null {
  try {
    const ogTitleMatch = html.match(/<meta\s+(?:property="og:title"|name="title")[^>]*content="([^"]+)"/i);
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const name = ogTitleMatch?.[1] || titleMatch?.[1]?.trim();

    const ogImageMatch = html.match(/<meta\s+property="og:image"[^>]*content="([^"]+)"/i);
    const logo = ogImageMatch?.[1];

    const ogDescMatch = html.match(/<meta\s+(?:property="og:description"|name="description")[^>]*content="([^"]+)"/i);
    const description = ogDescMatch?.[1];

    const authorMatch = html.match(/<meta\s+name="author"[^>]*content="([^"]+)"/i);
    const author = authorMatch?.[1];

    if (!name && !logo && !description) return null;

    return {
      name,
      logo,
      description,
      author,
    };
  } catch (error) {
    console.error('Error parsing meta tags:', error);
    return null;
  }
}

/**
 * Helper function to resolve relative URLs to absolute URLs
 */
export function resolveUrl(baseUrl: string, relativeUrl: string | undefined): string | undefined {
  if (!relativeUrl) return undefined;

  try {
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }

    const base = new URL(baseUrl);
    const resolved = new URL(relativeUrl, base);
    return resolved.href;
  } catch {
    return relativeUrl;
  }
}