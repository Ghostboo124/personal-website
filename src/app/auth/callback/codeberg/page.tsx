import { fetchQuery } from "convex/nextjs";
import { X } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Doc } from "../../../../../convex/_generated/dataModel";

type CallbackSearchParams = {
  code: string;
  state: string;
};

type PageProps = {
  searchParams: Promise<CallbackSearchParams>;
};

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

export default async function CodebergCallback({ searchParams }: PageProps) {
  const { state, code } = await searchParams;
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
  };
  let oauthStateOk: {
    ok: boolean;
    error?: string;
    oauth_state?: Doc<"oauthStates">;
  };
  if (state) {
    stateVerifyOk = await fetchQuery(api.oauth.verifyState, { state });
    oauthStateOk = await fetchQuery(api.oauth.getOauthState, { state });
  } else {
    stateVerifyOk = { ok: false };
    oauthStateOk = { ok: false };
  }

  if (!isOk || !stateVerifyOk.ok || !oauthStateOk.ok) {
    return (
      <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
        <div className="w-full max-w-145 bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Title */}
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-ctp-text">OAuth failed</h1>
            {!stateVerifyOk.ok && stateVerifyOk.error && (
              <ErrorMessage errorMessage={stateVerifyOk.error} />
            )}

            {!oauthStateOk.ok && oauthStateOk.error && (
              <ErrorMessage errorMessage={oauthStateOk.error} />
            )}

            {!isOk &&
              errors.map((error, index) => {
                // biome-ignore lint/suspicious/noArrayIndexKey: false
                return <ErrorMessage errorMessage={error} key={index} />;
              })}
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-ctp-mantle flex gap-3">
            <button
              className="flex-1 px-6 py-3 bg-ctp-green hover:bg-ctp-green-700 text-ctp-base font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              type="button"
            >
              Sign In
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
        </div>
      </div>
    );
  }

  const accessTokenURLParams = new URLSearchParams({
    client_id: oauthStateOk.oauth_state!.clientId,
    client_secret: process.env.CODEBERG_OAUTH_CLIENT_SECRET!,
    redirect_uri: oauthStateOk.oauth_state!.redirectUri,
    code,
    grant_type: "authorization_code",
    code_verifier: oauthStateOk.oauth_state!.codeVerifier!,
  });

  const response = await fetch(
    "https://codeberg.org/login/oauth/access_token",
    {
      method: "POST",
      body: accessTokenURLParams,
      headers: {
        Accept: "application/json",
      },
    },
  );

  const response_json: OAuthResponse = await response.json();

  if (response_json.success === false) {
    return (
      <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
        <div className="w-full max-w-145 bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Title */}
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-ctp-text">OAuth failed</h1>
            {response.status === 400 ? (
              <ErrorMessage errorMessage="codeVerifier was invalid, please try again" />
            ) : (
              response_json.error_description
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-ctp-mantle flex gap-3">
            <button
              className="flex-1 px-6 py-3 bg-ctp-green hover:bg-ctp-green-700 text-ctp-base font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              type="button"
            >
              Sign In
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
        </div>
      </div>
    );
  }

  const user_info = await fetch("https://codeberg.org/api/v1/user", {
    method: "GET",
    headers: {
      Authorization: `token ${response_json.access_token}`,
      Accept: "application/json",
    },
  });

  const user_info_json = await user_info.json();

  return (
    <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
      <div className="w-full max-w-145 bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 text-ctp-text">
          <p>{user_info_json.login}</p>
          <p>{user_info_json.full_name}</p>
          <p>{user_info_json.email}</p>
          <p>
            {user_info.status}
            {!user_info.ok && <> - {user_info_json.message}</>}
          </p>
        </div>
      </div>
    </div>
  );
}

interface RedirectURIprops {
  errorMessage: string;
}

export function ErrorMessage({ errorMessage }: RedirectURIprops) {
  return (
    <div className="px-8 py-4">
      <div className="bg-ctp-red/10 border border-ctp-red/40 rounded-lg p-4 flex gap-3">
        <div className="shrink-0">
          <X className="w-5 h-5 text-ctp-red" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ctp-red mb-1">
            {errorMessage}
          </h3>
        </div>
      </div>
    </div>
  );
}
