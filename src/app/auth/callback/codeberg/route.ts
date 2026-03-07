import { fetchMutation, fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

type OAuthResponseOk = {
  success: true;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
};

type OAuthResponseBad = {
  success: false;
  error: string;
  error_description: string;
};

type OAuthResponse = OAuthResponseOk | OAuthResponseBad;

async function setCookie(name: string, value: string, maxAge?: number) {
  (await cookies()).set(name, value, {
    httpOnly: true, // XSS protection
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
    path: "/", // Restrictive scope
    maxAge,
  });
}

export const GET = async (request: Request) => {
  // Extract search params from the URL
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const code = searchParams.get("code");

  let isOk = true;
  const errors: string[] = [];

  if (!state) {
    isOk = false;
    errors.push("State could not be found in the URL paramaters");
  }

  if (!code) {
    isOk = false;
    errors.push("Code could not be found in the URL parameters");
  }

  if (!process.env.CODEBERG_OAUTH_CLIENT_SECRET) {
    isOk = false;
    errors.push(
      "Could not find Codeberg OAuth2 Client Secred (please contact Lexy)",
    );
  }

  let oauthStateOk: {
    ok: boolean;
    error?: string;
    oauth_state?: Doc<"oauthStates">;
  } = { ok: false };
  if (state) {
    oauthStateOk = await fetchMutation(api.oauth.consumeState, { state });
  }

  if (!isOk || !oauthStateOk.ok) {
    const errorMessages: string[] = [];

    if (!oauthStateOk.ok && oauthStateOk.error) {
      errorMessages.push(oauthStateOk.error);
    }

    if (!isOk) {
      errorMessages.push(...errors);
    }

    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "codeberg",
      errors: JSON.stringify(errorMessages),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const accessTokenURLParams = new URLSearchParams({
    client_id: oauthStateOk.oauth_state!.clientId,
    client_secret: process.env.CODEBERG_OAUTH_CLIENT_SECRET!,
    redirect_uri: oauthStateOk.oauth_state!.redirectUri,
    code: code!,
    grant_type: "authorization_code",
    code_verifier: oauthStateOk.oauth_state!.codeVerifier!,
  });

  let response: Response;
  try {
    response = await fetch("https://codeberg.org/login/oauth/access_token", {
      method: "POST",
      body: accessTokenURLParams,
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "codeberg",
      errors: JSON.stringify([
        "Failed to connect to Codeberg. Please try again.",
      ]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const response_json: OAuthResponse = await response.json();

  if (response_json.success === false) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "codeberg",
      errors: JSON.stringify([
        response.status === 400
          ? "codeVerifier was invalid, please try again"
          : response_json.error_description,
      ]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const user_info = await fetch("https://codeberg.org/api/v1/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${response_json.access_token}`,
      Accept: "application/json",
    },
  });

  if (!user_info.ok) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "codeberg",
      errors: JSON.stringify([user_info.statusText]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const user_info_json = await user_info.json();

  let userUpdateOk: {
    ok: boolean;
    userId?: Id<"users">;
    error?: string;
  } = { ok: false, error: "Could not find information" };
  if (
    user_info_json.login &&
    user_info_json.full_name &&
    user_info_json.email &&
    user_info.ok
  ) {
    userUpdateOk = await fetchMutation(api.users.updateUser, {
      username: user_info_json.login,
      name: user_info_json.full_name,
      email: user_info_json.email,
      oauth_method: "codeberg",
    });
  }

  if (!userUpdateOk.ok) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "codeberg",
      errors: JSON.stringify([`User Update: ${userUpdateOk.error!}`]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const sessionAuthOk: {
    ok: boolean;
    error?: string;
    token?: string;
  } = await fetchMutation(api.session.auth, {
    userId: userUpdateOk.userId!,
    ipAddress:
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "Unknown",
    userAgent: request.headers.get("user-agent") || "Unknown",
  });

  if (!sessionAuthOk.ok) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "codeberg",
      errors: JSON.stringify([sessionAuthOk.error!]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  await setCookie("sessionId", sessionAuthOk.token!, 7 * 24 * 60 * 60 * 1000);

  const successParams = new URLSearchParams({
    ok: "true",
    provider: "codeberg",
  });

  return Response.redirect(new URL(`/auth?${successParams}`, request.url));
};
