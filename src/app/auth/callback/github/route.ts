import { fetchMutation, fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import { api } from "../../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

async function setCookie(name: string, value: string, maxAge?: number) {
  (await cookies()).set(name, value, {
    httpOnly: true, // XSS protection
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
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

  if (!process.env.CODEBERG_OAUTH_CLIENT_SECRET) {
    isOk = false;
    errors.push(
      "Could not find Codeberg OAuth2 Client Secred (please contact Lexy)",
    );
  }

  let stateVerifyOk: {
    ok: boolean;
    error?: string;
    record?: Doc<"oauthStates">;
  } = { ok: false };
  let oauthStateOk: {
    ok: boolean;
    error?: string;
    oauth_state?: Doc<"oauthStates">;
  } = { ok: false };
  let deleteOauthStateOk: {
    ok: boolean;
    error?: string;
  } = { ok: false };
  if (state) {
    stateVerifyOk = await fetchQuery(api.oauth.verifyState, { state });
    oauthStateOk = await fetchQuery(api.oauth.getOauthState, { state });
    deleteOauthStateOk = await fetchMutation(api.oauth.deleteState, {
      stateId: oauthStateOk.oauth_state?._id,
    });
  }

  if (
    !isOk ||
    !stateVerifyOk.ok ||
    !oauthStateOk.ok ||
    !deleteOauthStateOk.ok
  ) {
    const errorMessages: string[] = [];

    if (
      !stateVerifyOk.ok &&
      stateVerifyOk.error &&
      stateVerifyOk.error !== oauthStateOk.error
    ) {
      errorMessages.push(stateVerifyOk.error);
    }

    if (!oauthStateOk.ok && oauthStateOk.error) {
      errorMessages.push(oauthStateOk.error);
    }

    if (!deleteOauthStateOk.ok && deleteOauthStateOk.error) {
      errorMessages.push(deleteOauthStateOk.error);
    }

    if (!isOk) {
      errorMessages.push(...errors);
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

  if (!response.ok) {
    const errorParams = new URLSearchParams({
      ok: "false",
      provider: "github",
      errors: JSON.stringify([
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
  } = { ok: false, error: "Could not find information" };
  if (
    user_info_json.login &&
    user_info_json.name &&
    user_info_json.email &&
    user_info.ok
  ) {
    userUpdateOk = await fetchMutation(api.users.updateUser, {
      username: user_info_json.login,
      name: user_info_json.name,
      email: user_info_json.email,
      oauth_method: "github",
    });
  }

  if (!userUpdateOk.ok) {
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

  await setCookie("sessionId", sessionAuthOk.token!);

  const successParams = new URLSearchParams({
    ok: "true",
    provider: "github",
    username: user_info_json.login,
    name: user_info_json.name,
    email: user_info_json.email,
    id: userUpdateOk.userId!,
  });

  return Response.redirect(new URL(`/auth?${successParams}`, request.url));
};
