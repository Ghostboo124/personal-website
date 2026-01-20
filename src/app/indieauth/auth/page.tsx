import { AlertTriangle, Mail, User } from "lucide-react";
import { fetchClientMetadata } from "@/lib/utils";

type IndieAuthSearchParams = {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge: string;
  code_challenge_method: string;
  scope: string;
  me?: string;
};

type PageProps = {
  searchParams: Promise<IndieAuthSearchParams>;
};

const scopes_supported = ["profile", "email"];

// Mock data for preview
const mockData = {
  userName: "Lexy Perkins",
  userEmail: "perkinsal@student.jpc.qld.edu.au",
  scopes: ["profile", "email"] as const,
};

type ScopeType = (typeof scopes_supported)[number];

export default async function AuthEndpoint({ searchParams }: PageProps) {
  const search_params = await searchParams;
  const clientMetadata = await fetchClientMetadata(search_params.client_id);

  const appName = clientMetadata.client_name || "Unknown App";
  const appNameFormatted = appName.charAt(0).toUpperCase() + appName.slice(1);

  let redirect_uri_valid: boolean = true;
  if (search_params.client_id !== search_params.redirect_uri) {
    redirect_uri_valid = clientMetadata.redirect_uris
      ? clientMetadata.redirect_uris?.includes(search_params.redirect_uri)
      : false;
  }

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
      detail: `Name: ${mockData.userName}`,
    },
    email: {
      title: "See your email address",
      detail: `Email: ${mockData.userEmail}`,
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
            {mockData.scopes.map((scope) => {
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
        <div className="p-6 bg-ctp-mantle flex gap-3">
          <button
            className="flex-1 px-6 py-3 bg-ctp-red hover:bg-ctp-red-700 text-ctp-base font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            type="button"
          >
            Deny
          </button>
          <button
            className="flex-1 px-6 py-3 bg-ctp-green hover:bg-ctp-green-700 text-ctp-base font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            type="button"
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
