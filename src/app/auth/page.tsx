"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type AuthResult =
  | {
      ok: true;
      provider: string;
      username: string;
      name: string;
      email: string;
      id: string;
    }
  | {
      ok: false;
      provider: string;
      errors: string[];
    }
  | null;

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authResult, setAuthResult] = useState<AuthResult>(null);

  useEffect(() => {
    const ok = searchParams.get("ok");
    const provider = searchParams.get("provider");

    if (!ok || !provider) {
      router.replace("/auth/login");
      return;
    }

    if (ok === "true") {
      setAuthResult({
        ok: true,
        provider,
        username: searchParams.get("username") || "",
        name: searchParams.get("name") || "",
        email: searchParams.get("email") || "",
        id: searchParams.get("id") || "",
      });
    } else {
      const errorsParam = searchParams.get("errors");
      let errors: string[] = [];
      try {
        errors = errorsParam ? JSON.parse(errorsParam) : [];
      } catch {
        errors = errorsParam ? [errorsParam] : [];
      }
      setAuthResult({
        ok: false,
        provider,
        errors,
      });
    }
  }, [searchParams, router]);

  if (!authResult) {
    return (
      <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
        <div className="w-16 h-16 border-4 border-ctp-lavender/40 border-t-ctp-mauve rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
      <div className="w-full max-w-md bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden p-8">
        {authResult.ok ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ctp-green mb-4">
              Authentication Successful
            </h1>
            <p className="text-ctp-subtext0 mb-2">
              Signed in via {authResult.provider}
            </p>
            <div className="mt-6 text-left space-y-2 text-ctp-text">
              <p>
                <span className="text-ctp-subtext0">Username:</span>{" "}
                {authResult.username}
              </p>
              <p>
                <span className="text-ctp-subtext0">Name:</span>{" "}
                {authResult.name}
              </p>
              <p>
                <span className="text-ctp-subtext0">Email:</span>{" "}
                {authResult.email}
              </p>
              <p>
                <span className="text-ctp-subtext0">ID:</span> {authResult.id}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ctp-red mb-4">
              Authentication Failed
            </h1>
            <p className="text-ctp-subtext0 mb-4">
              Error with {authResult.provider}
            </p>
            <ul className="text-left text-ctp-text space-y-2">
              {authResult.errors.map((error) => (
                <li key={error} className="text-ctp-red">
                  • {error}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="mt-6 px-6 py-3 bg-ctp-lavender hover:bg-ctp-lavender/80 text-ctp-base font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense
      fallback={
        <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
          <div className="w-16 h-16 border-4 border-ctp-lavender/40 border-t-ctp-mauve rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
