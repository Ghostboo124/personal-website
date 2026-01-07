export async function GET() {
  return Response.json({
    issuer: "https://personal.apcoding.com.au/",
    authorization_endpoint: "https://personal.apcoding.com.au/indieauth/auth",
    token_endpoint: "https://personal.apcoding.com.au/indieauth/token",
    introspection_endpoint:
      "https://personal.apcoding.com.au/indieauth/introspection",
    introspection_endpoint_auth_methods_supported: [
      "none",
      "client_secret_basic",
      "client_secret_jwt",
    ],
    revocation_endpoint:
      "https://personal.apcoding.com.au/indieauth/revocation",
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
    userinfo_endpoint: "https://personal.apcoding.com.au/indieauth/userinfo",
  });
}
