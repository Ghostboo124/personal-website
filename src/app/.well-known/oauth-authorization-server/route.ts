export const oauthAuthorizationServerInformation = {
  issuer: "https://www.lexy.boo/",
  authorization_endpoint: "https://www.lexy.boo/indieauth/auth",
  token_endpoint: "https://www.lexy.boo/indieauth/token",
  introspection_endpoint: "https://www.lexy.boo/indieauth/introspection",
  introspection_endpoint_auth_methods_supported: [
    "none",
    "client_secret_basic",
    "client_secret_jwt",
  ],
  revocation_endpoint: "https://www.lexy.boo/indieauth/revocation",
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
  userinfo_endpoint: "https://www.lexy.boo/indieauth/userinfo",
};

export async function GET() {
  return Response.json(oauthAuthorizationServerInformation);
}
