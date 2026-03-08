import { fetchMutation } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

async function setCookie(name: string, value: string, maxAge?: number) {
  (await cookies()).set(name, value, {
    httpOnly: true, // XSS protection
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax", // OAuth callback requires Lax to allow cross-site redirects from provider
    path: "/", // Restrictive scope
    maxAge,
  });
}

/*
{
  ok: true;
  username?: string;
  name?: string;
  email?: string;
  id?: Id<"users">;
  errors?: string[];
}
*/
export const GET = async (request: Request): Promise<Response> => {
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

  if (!process.env.GITHUB_OAUTH_CLIENT_SECRET) {
    isOk = false;
    errors.push(
      "Could not find GitHub OAuth2 Client Secret (please contact Lexy)",
    );
  }

  if (!isOk) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "github",
      errors: JSON.stringify(errors),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  let oauthStateOk: {
    ok: boolean;
    error?: string;
    oauth_state?: Doc<"oauthStates">;
  } = { ok: false };
  if (state) {
    oauthStateOk = await fetchMutation(api.oauth.consumeState, { state });
  }

  if (!oauthStateOk.ok) {
    const errorMessages: string[] = [];

    if (oauthStateOk.error) {
      errorMessages.push(oauthStateOk.error);
    }

    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "github",
      errors: JSON.stringify(errorMessages),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const accessTokenURLParams = new URLSearchParams({
    client_id: oauthStateOk.oauth_state!.clientId,
    client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET!,
    redirect_uri: oauthStateOk.oauth_state!.redirectUri,
    code: code!,
    grant_type: "authorization_code",
    code_verifier: oauthStateOk.oauth_state!.codeVerifier!,
  });

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: accessTokenURLParams,
    headers: {
      Accept: "application/json",
    },
  });

  const response_json = await response.json();

  if (!response.ok || response_json.error || !response_json.access_token) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "github",
      errors: JSON.stringify([
        response_json.error ||
          `Access Token: ${response.status}: ${response.statusText}`,
      ]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const user_info = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${response_json.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/json",
    },
  });

  if (!user_info.ok) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "github",
      errors: JSON.stringify([
        `User Info: ${user_info.status}: ${user_info.statusText}`,
      ]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  const user_info_json = await user_info.json();

  let userUpdateOk: {
    ok: boolean;
    userId?: Id<"users">;
    error?: string;
    linkedMethods?: string[];
  } = { ok: false, error: "Could not find information" };
  if (user_info_json.login && user_info.ok) {
    userUpdateOk = await fetchMutation(api.users.updateUser, {
      username: user_info_json.login,
      name: user_info_json.name || "",
      email: user_info_json.email || undefined,
      oauth_method: "github",
    });
  }

  if (!userUpdateOk.ok) {
    // Handle account linking flow when account exists with different OAuth method
    if (
      userUpdateOk.error === "account_exists_with_different_method" &&
      userUpdateOk.linkedMethods &&
      userUpdateOk.userId
    ) {
      const linkParams = new URLSearchParams({
        ok: "false",
        provider: "github",
        error: "account_exists",
        linkedMethods: userUpdateOk.linkedMethods.join(","),
        userId: userUpdateOk.userId,
        githubUsername: user_info_json.login,
        githubName: user_info_json.name || "",
        githubEmail: user_info_json.email || "",
      });
      return Response.redirect(
        new URL(`/auth/link?${linkParams}`, request.url),
      );
    }

    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "github",
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
      provider: "github",
      errors: JSON.stringify([sessionAuthOk.error!]),
    });
    return Response.redirect(new URL(`/auth?${errorParams}`, request.url));
  }

  await setCookie("sessionId", sessionAuthOk.token!, 7 * 24 * 60 * 60);

  const redirect = oauthStateOk.oauth_state!.redirect;

  let successParams: URLSearchParams;
  if (redirect) {
    successParams = new URLSearchParams({
      ok: "true",
      provider: "github",
      redirect,
    });
  } else {
    successParams = new URLSearchParams({
      ok: "true",
      provider: "github",
    });
  }

  return Response.redirect(new URL(`/auth?${successParams}`, request.url));
};
