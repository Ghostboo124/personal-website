import { type ClassValue, clsx } from "clsx";
import { mf2 } from "microformats-parser";
import { twMerge } from "tailwind-merge";

export interface ClientMetadata {
  client_id: string;
  client_name?: string;
  client_uri: string;
  logo_uri?: string;
  redirect_uris?: string[];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Fetches client metadata from the client_id URL
 * Parses microformats2 h-app data and falls back to meta tags
 */
export async function fetchClientMetadata(
  clientId: string,
): Promise<ClientMetadata> {
  const defaultMetadata: ClientMetadata = {
    client_id: clientId,
    client_name: extractNameFromUrl(clientId),
    client_uri: clientId,
  };

  try {
    const response = await fetch(clientId, {
      headers: {
        Accept: "text/html,application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      // TODO: Add proper logging - Failed to fetch client metadata
      return defaultMetadata;
    }

    const contentType = response.headers.get("content-type") || "";

    // Handle JSON metadata (OAuth 2.0 Client Metadata)
    if (contentType.includes("application/json")) {
      const json = await response.json();

      // TODO: Add proper logging - client_id mismatch in metadata
      // Verify client_id matches if provided
      if (json.client_id && json.client_id !== clientId) {
        // client_id in JSON doesn't match the URL it was fetched from
      }

      return {
        client_id: json.client_id || clientId,
        client_name: json.client_name || defaultMetadata.client_name,
        client_uri: json.client_uri || clientId,
        logo_uri: json.logo_uri,
        redirect_uris: json.redirect_uris,
      };
    }

    // Parse HTML
    const html = await response.text();

    // Parse microformats2
    const mfData = mf2(html, { baseUrl: clientId });

    // Look for h-app or h-x-app
    const app = mfData.items?.find(
      (item) => item.type?.includes("h-app") || item.type?.includes("h-x-app"),
    );

    if (app?.properties) {
      const props = app.properties;

      // Helper to extract string values from microformat properties
      const getString = (prop: unknown): string | undefined => {
        if (Array.isArray(prop) && prop.length > 0) {
          const first = prop[0];
          if (typeof first === "string") return first;
          if (typeof first === "object" && first.properties?.name?.[0]) {
            return first.properties.name[0];
          }
        }
        return undefined;
      };

      // Helper to extract array of strings
      const getStringArray = (prop: unknown): string[] | undefined => {
        if (Array.isArray(prop)) {
          const strings = prop.filter((item) => typeof item === "string");
          return strings.length > 0 ? strings : undefined;
        }
        return undefined;
      };

      return {
        client_id: clientId,
        client_name: getString(props.name) || defaultMetadata.client_name,
        client_uri: getString(props.url) || clientId,
        logo_uri: getString(props.logo) || getString(props.photo),
        redirect_uris:
          getStringArray(props["redirect-uri"]) ||
          getStringArray(props.redirect_uri),
      };
    }

    // Fallback to meta tags if no microformats found
    const metaData = parseMetaTags(html);
    if (metaData) {
      return { ...defaultMetadata, ...metaData };
    }

    return defaultMetadata;
  } catch (_error) {
    // TODO: Add proper logging - Error fetching client metadata
    return defaultMetadata;
  }
}

/**
 * Extract a reasonable app name from the URL
 */
function extractNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace("www.", "");
    const path = urlObj.pathname.split("/").filter(Boolean)[0];

    if (path) {
      return path.charAt(0).toUpperCase() + path.slice(1);
    }

    const domainParts = hostname.split(".");
    const mainDomain = domainParts[domainParts.length - 2] || domainParts[0];
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  } catch {
    return "Unknown Application";
  }
}

/**
 * Parse metadata from HTML meta tags and link tags as fallback
 * Looking for OAuth 2.0 Client Metadata in <link> tags or Open Graph tags
 */
function parseMetaTags(html: string): Partial<ClientMetadata> | null {
  try {
    const ogTitleMatch = html.match(
      /<meta\s+(?:property="og:title"|name="title"|name="application-name")[^>]*content="([^"]+)"/i,
    );
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const client_name = ogTitleMatch?.[1] || titleMatch?.[1]?.trim();

    const ogImageMatch = html.match(
      /<meta\s+property="og:image"[^>]*content="([^"]+)"/i,
    );
    const logo_uri = ogImageMatch?.[1];

    if (!client_name && !logo_uri) return null;

    return {
      client_name,
      logo_uri,
    };
  } catch (_error) {
    // TODO: Add proper logging - Error parsing meta tags
    return null;
  }
}

/**
 * Helper function to resolve relative URLs to absolute URLs
 */
export function resolveUrl(
  baseUrl: string,
  relativeUrl: string | undefined,
): string | undefined {
  if (!relativeUrl) return undefined;

  try {
    if (
      relativeUrl.startsWith("http://") ||
      relativeUrl.startsWith("https://")
    ) {
      return relativeUrl;
    }

    const base = new URL(baseUrl);
    const resolved = new URL(relativeUrl, base);
    return resolved.href;
  } catch {
    return relativeUrl;
  }
}

// Utility functions for PKCE
export function generateRandomString(length: number): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generateCodeChallenge(
  codeVerifier: string,
): Promise<string> {
  const hashed = await sha256(codeVerifier);
  return base64urlencode(hashed);
}
