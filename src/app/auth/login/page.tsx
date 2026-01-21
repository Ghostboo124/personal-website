"use client";

import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { generateCodeChallenge, generateRandomString } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";

export default function AuthEndpoint() {
  const [baseUrl, setBaseUrl] = useState("");
  const saveState = useMutation(api.oauth.saveState);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const redirect_base_uri = `${baseUrl}/auth/callback`;

  const authCodeberg = async () => {
    if (!process.env.NEXT_PUBLIC_CODEBERG_OAUTH_CLIENT_ID) {
      return; // TODO: Add an error message
    }
    const state = generateRandomString(43);
    const clientId = process.env.NEXT_PUBLIC_CODEBERG_OAUTH_CLIENT_ID;
    const redirectUri = `${redirect_base_uri}/codeberg`;
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const codeChallengeMethod = "S256";
    const scope = "openid profile email";

    await saveState({
      state,
      clientId,
      redirectUri,
      codeVerifier,
      codeChallenge,
      codeChallengeMethod,
      scope,
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    window.location.href = `https://codeberg.org/login/oauth/authorize?${params}`;
  };

  // const authHackClub = async () => {
  //   if (!process.env.NEXT_PUBLIC_HACKCLUB_OAUTH_CLIENT_ID) {
  //     return;
  //   }
  //   const state = generateRandomString(43);
  //   const clientId = process.env.NEXT_PUBLIC_HACKCLUB_OAUTH_CLIENT_ID;
  //   const redirectUri = `${redirect_base_uri}/hackclub`;
  //   const codeVerifier = generateRandomString(128);
  //   const codeChallenge = await generateCodeChallenge(codeVerifier);
  //   const codeChallengeMethod = "S256";
  //   const scope = "openid profile email";

  //   await saveState({
  //     state,
  //     clientId,
  //     redirectUri,
  //     codeVerifier,
  //     codeChallenge,
  //     codeChallengeMethod,
  //     scope,
  //   });

  //   const params = new URLSearchParams({
  //     client_id: clientId,
  //     redirect_uri: redirectUri,
  //     response_type: "code",
  //     scope: scope,
  //     state: state,
  //     code_challenge: codeChallenge,
  //     code_challenge_method: codeChallengeMethod,
  //   });

  //   window.location.href = `https://auth.hackclub.com/oauth/authorize?${params}`;
  // };

  const authGithub = async () => {
    if (!process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID) {
      return;
    }
    const state = generateRandomString(43);
    const clientId = process.env.NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID;
    const redirectUri = `${redirect_base_uri}/github`;
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const codeChallengeMethod = "S256";
    const scope = "openid profile email";

    await saveState({
      state,
      clientId,
      redirectUri,
      codeVerifier,
      codeChallenge,
      codeChallengeMethod,
      scope,
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  };

  return (
    <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
      <div className="w-full max-w-145 bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        {/* Title */}
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-ctp-text mb-2">
            Sign in to your account with
          </h1>
        </div>

        {/* OAuth Providers */}
        <div className="flex flex-col text-ctp-base items-center gap-4">
          <Button
            className="w-sm bg-ctp-lavender hover:bg-ctp-lavender-700 p-6 font-semibold rounded-lg transition-colors"
            variant="outline"
            size="sm"
            onClick={authCodeberg}
          >
            Codeberg
          </Button>
          {/* <Button
            className="w-sm bg-ctp-lavender hover:bg-ctp-lavender-700 p-6 font-semibold rounded-lg transition-colors"
            variant="outline"
            size="sm"
            onClick={authHackClub}
          >
            Hack Club Auth
          </Button> */}
          <Button
            className="w-sm bg-ctp-lavender hover:bg-ctp-lavender-700 p-6 font-semibold rounded-lg transition-colors"
            variant="outline"
            size="sm"
            onClick={authGithub}
          >
            GitHub
          </Button>
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
