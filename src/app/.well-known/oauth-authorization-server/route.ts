import { headers } from "next/headers";

function getBaseUrl(headerStore: Headers): string {
  const host = headerStore.get("host") || "www.lexy.boo";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export function getOauthAuthorizationServerInformation(baseUrl: string) {
  return {
    issuer: `${baseUrl}/`,
    authorization_endpoint: `${baseUrl}/indieauth/auth`,
    token_endpoint: `${baseUrl}/indieauth/token`,
    introspection_endpoint: `${baseUrl}/indieauth/introspection`,
    introspection_endpoint_auth_methods_supported: [
      "none",
      "client_secret_basic",
      "client_secret_jwt",
    ],
    revocation_endpoint: `${baseUrl}/indieauth/revocation`,
    revocation_endpoint_auth_methods_supported: [
      "none",
      "client_secret_basic",
      "client_secret_jwt",
    ],
    scopes_supported: ["profile", "email"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    service_documentation: "https://indieauth.spec.indieweb.org",
    code_challenge_methods_supported: ["S256"],
    authorization_response_iss_parameter_supported: true,
    userinfo_endpoint: `${baseUrl}/indieauth/userinfo`,
  };
}

export async function GET() {
  const headerStore = await headers();
  const baseUrl = getBaseUrl(headerStore);
  return Response.json(getOauthAuthorizationServerInformation(baseUrl));
}
