import { fetchMutation, fetchQuery } from "convex/nextjs";
import { AlertTriangle, Mail, User } from "lucide-react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { fetchClientMetadata, generateRandomString } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

function getBaseUrl(headerStore: Headers): string {
  const host = headerStore.get("host") || "www.lexy.boo";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

type IndieAuthSearchParams = {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
  scope?: string;
  me?: string;
};

type PageProps = {
  searchParams: Promise<IndieAuthSearchParams>;
};

const scopes_supported = ["profile", "email"] as const;

type ScopeType = (typeof scopes_supported)[number];

async function getAuthenticatedUser(): Promise<{
  authenticated: boolean;
  userId?: Id<"users">;
  user?: { name: string; email: string };
}> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const sessionToken = cookieStore.get("sessionId")?.value;
  if (!sessionToken) {
    return { authenticated: false };
  }

  const ipAddress =
    headerStore.get("x-forwarded-for")?.split(",")[0].trim() || "Unknown";
  const userAgent = headerStore.get("user-agent") || "Unknown";

  const sessionCheck = await fetchQuery(api.session.checkAuthStatus, {
    sessionToken,
    ipAddress,
    userAgent,
  });

  if (!sessionCheck.ok || !sessionCheck.userId) {
    return { authenticated: false };
  }

  const userResult = await fetchQuery(api.users.getUser, {
    userId: sessionCheck.userId as Id<"users">,
  });

  if (!userResult.ok || !userResult.user) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    userId: userResult.user._id,
    user: {
      name: userResult.user.name,
      email: userResult.user.email,
    },
  };
}

async function handleAuthorization(formData: FormData): Promise<void> {
  "use server";

  const headerStore = await headers();
  const baseUrl = getBaseUrl(headerStore);

  const action = formData.get("action") as string;
  const state = formData.get("state") as string;

  // Retrieve stored authorization request parameters from server
  const storedRequest = await fetchQuery(
    api.indieauth.getStoredAuthorizationRequest,
    { state },
  );

  if (!storedRequest.ok || !storedRequest.data) {
    // State not found or expired - cannot proceed
    const redirectUrl = new URL(`${baseUrl}/auth`);
    redirectUrl.searchParams.set("ok", "false");
    redirectUrl.searchParams.set(
      "errors",
      JSON.stringify(["Invalid or expired authorization request"]),
    );
    redirect(redirectUrl.toString());
  }

  const clientId = storedRequest.data.clientId;
  const redirectUri = storedRequest.data.redirectUri;
  const codeChallenge = storedRequest.data.codeChallenge || "";
  const codeChallengeMethod = storedRequest.data.codeChallengeMethod || "";
  const scope = storedRequest.data.scope;

  // Validate redirect_uri against client's registered redirect_uris
  const clientMetadata = await fetchClientMetadata(clientId);

  let redirectUriValid = true;
  if (clientId !== redirectUri) {
    redirectUriValid = clientMetadata.redirect_uris
      ? clientMetadata.redirect_uris.includes(redirectUri)
      : false;
  }

  if (!redirectUriValid) {
    // Cannot redirect to untrusted URI; return error without redirecting
    const errorUrl = new URL(`${baseUrl}/auth`);
    errorUrl.searchParams.set("ok", "false");
    errorUrl.searchParams.set(
      "errors",
      JSON.stringify(["Invalid redirect_uri"]),
    );
    redirect(errorUrl.toString());
  }

  const redirectUrl = new URL(redirectUri);

  // Re-authenticate the user to prevent tampering with the hidden user_id field
  const authResult = await getAuthenticatedUser();
  if (!authResult.authenticated || !authResult.userId) {
    redirectUrl.searchParams.set("error", "access_denied");
    redirectUrl.searchParams.set("state", state);
    redirect(redirectUrl.toString());
  }

  if (action === "deny") {
    // Clean up stored authorization request
    await fetchMutation(api.indieauth.deleteStoredAuthorizationRequest, {
      state,
    });
    redirectUrl.searchParams.set("error", "access_denied");
    redirectUrl.searchParams.set("state", state);
    redirect(redirectUrl.toString());
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionId")?.value;
  if (!sessionToken) {
    redirectUrl.searchParams.set("error", "server_error");
    redirectUrl.searchParams.set("state", state);
    redirect(redirectUrl.toString());
  }

  const code = generateRandomString(64);

  const result = await fetchMutation(api.indieauth.createAuthorizationCode, {
    code,
    userId: authResult.userId,
    clientId,
    redirectUri,
    scope,
    codeChallenge,
    codeChallengeMethod,
    sessionToken,
  });

  if (!result.ok) {
    redirectUrl.searchParams.set("error", "server_error");
    redirectUrl.searchParams.set("state", state);
    redirect(redirectUrl.toString());
  }

  // Clean up stored authorization request after successful authorization
  await fetchMutation(api.indieauth.deleteStoredAuthorizationRequest, {
    state,
  });

  redirectUrl.searchParams.set("code", code);
  redirectUrl.searchParams.set("state", state);
  redirectUrl.searchParams.set("iss", `${baseUrl}/`);
  redirect(redirectUrl.toString());
}

export default async function AuthEndpoint({ searchParams }: PageProps) {
  const search_params = await searchParams;
  const headerStore = await headers();
  const baseUrl = getBaseUrl(headerStore);

  const authResult = await getAuthenticatedUser();

  if (!authResult.authenticated || !authResult.user || !authResult.userId) {
    const currentUrl = new URL(`${baseUrl}/indieauth/auth`);
    currentUrl.searchParams.set("response_type", search_params.response_type);
    currentUrl.searchParams.set("client_id", search_params.client_id);
    currentUrl.searchParams.set("redirect_uri", search_params.redirect_uri);
    currentUrl.searchParams.set("state", search_params.state);
    currentUrl.searchParams.set("code_challenge", search_params.code_challenge);
    currentUrl.searchParams.set(
      "code_challenge_method",
      search_params.code_challenge_method,
    );
    if (search_params.scope) {
      currentUrl.searchParams.set("scope", search_params.scope);
    }
    if (search_params.me) {
      currentUrl.searchParams.set("me", search_params.me);
    }

    const loginUrl = new URL(`${baseUrl}/auth/login`);
    loginUrl.searchParams.set("redirect", currentUrl.toString());
    redirect(loginUrl.toString());
  }

  // Store authorization request parameters server-side to prevent tampering
  const storeResult = await fetchMutation(
    api.indieauth.storeAuthorizationRequest,
    {
      state: search_params.state,
      clientId: search_params.client_id,
      redirectUri: search_params.redirect_uri,
      codeChallenge: search_params.code_challenge,
      codeChallengeMethod: search_params.code_challenge_method,
      scope: search_params.scope,
    },
  );

  if (!storeResult.ok) {
    const errorUrl = new URL(`${baseUrl}/auth`);
    errorUrl.searchParams.set("ok", "false");
    errorUrl.searchParams.set(
      "errors",
      JSON.stringify([
        storeResult.error || "Failed to store authorization request",
      ]),
    );
    redirect(errorUrl.toString());
  }

  const clientMetadata = await fetchClientMetadata(search_params.client_id);

  const appName = clientMetadata.client_name || "Unknown App";
  const appNameFormatted = appName.charAt(0).toUpperCase() + appName.slice(1);

  let redirect_uri_valid = true;
  if (search_params.client_id !== search_params.redirect_uri) {
    redirect_uri_valid = clientMetadata.redirect_uris
      ? clientMetadata.redirect_uris?.includes(search_params.redirect_uri)
      : false;
  }

  const requestedScopes = search_params.scope
    ? search_params.scope.split(" ").filter((s) => scopes_supported.includes(s))
    : [];

  const scopeIcons: Record<ScopeType, React.ReactElement> = {
    profile: <User className="w-5 h-5 text-ctp-lavender" />,
    email: <Mail className="w-5 h-5 text-ctp-lavender" />,
  };

  const scopeLabels: Record<
    ScopeType,
    { title: string; detail: string; extra?: string }
  > = {
    profile: {
      title: "See your name and profile information",
      detail: `Name: ${authResult.user.name}`,
    },
    email: {
      title: "See your email address",
      detail: `Email: ${authResult.user.email}`,
    },
  };

  return (
    <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
      <div className="w-full max-w-145 bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-ctp-text mb-2">
            Continue to {appNameFormatted}?
          </h1>
          <p className="text-ctp-subtext0 text-sm">
            Authorize{" "}
            <span className="font-bold text-ctp-lavender">
              {appNameFormatted}
            </span>{" "}
            to use your account?
          </p>
        </div>

        {/* Warning if redirect uri is invalid */}
        {!redirect_uri_valid && (
          <InvalidRedirectURI
            redirect_uri={search_params.redirect_uri}
            redirect_uris={clientMetadata.redirect_uris}
          />
        )}

        {/* Permissions List */}
        <div className="p-8">
          <h2 className="text-sm font-semibold text-ctp-text uppercase tracking-wider mb-4">
            This application will be able to:
          </h2>

          <div className="space-y-3">
            {requestedScopes.map((scope) => {
              const info = scopeLabels[scope];
              if (!info) return null;

              return (
                <div
                  key={scope}
                  className="bg-ctp-crust rounded-lg p-4 border border-ctp-surface1 hover:border-ctp-surface2 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{scopeIcons[scope]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ctp-text font-medium text-sm mb-1">
                        {info.title}
                      </p>
                      <p className="text-ctp-subtext0 text-xs break-all">
                        {info.detail}
                      </p>
                      {info.extra && (
                        <p className="text-ctp-subtext1 text-xs break-all mt-0.5">
                          {info.extra}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <form action={handleAuthorization}>
          {/* Only state is passed in form; all other params are stored server-side */}
          <input type="hidden" name="state" value={search_params.state} />

          <div className="p-6 bg-ctp-mantle flex gap-3">
            <button
              className="flex-1 px-6 py-3 bg-ctp-red hover:bg-ctp-red-700 text-ctp-base font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              type="submit"
              name="action"
              value="deny"
            >
              Deny
            </button>
            <button
              className="flex-1 px-6 py-3 bg-ctp-green hover:bg-ctp-green-700 text-ctp-base font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              type="submit"
              name="action"
              value="authorize"
              disabled={!redirect_uri_valid}
            >
              Authorize
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RedirectURIprops {
  redirect_uri: string;
  redirect_uris?: string[];
}

export function InvalidRedirectURI({
  redirect_uri,
  redirect_uris,
}: RedirectURIprops) {
  let redirect_uris_string: string | null = null;
  if (redirect_uris) {
    redirect_uris_string = redirect_uris.join(", ");
  }

  return (
    <div className="px-8 py-4">
      <div className="bg-ctp-yellow/10 border border-ctp-yellow/40 rounded-lg p-4 flex gap-3">
        <div className="shrink-0">
          <AlertTriangle className="w-5 h-5 text-ctp-yellow" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ctp-yellow mb-1">
            Invalid Redirect URI
          </h3>
          <p className="text-sm text-ctp-text font-medium mb-1">
            The application has a redirect URI of {redirect_uri} which is not in
            the valid uri list
          </p>
          {redirect_uris && (
            <p className="text-sm text-ctp-subtext0">
              Valid URIs: {redirect_uris_string}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
