"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { deleteAccount, revokeSession, updateProfile } from "./actions";

type ProfileClientProps = {
  user: Doc<"users">;
  sessions: Doc<"sessions">[];
  currentSessionToken: string;
};

export function ProfileClient({
  user,
  sessions,
  currentSessionToken,
}: ProfileClientProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"profile" | "sessions" | "danger">(
    "profile",
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    username: user.username,
    name: user.name,
    email: user.email,
  });

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const data = new FormData();
    data.set("username", formData.username);
    data.set("name", formData.name);
    data.set("email", formData.email);

    startTransition(async () => {
      const result = await updateProfile(data);
      if (result.ok) {
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile",
        });
      }
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    startTransition(async () => {
      const result = await revokeSession(sessionId);
      if (result.ok) {
        setMessage({ type: "success", text: "Session revoked" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to revoke session",
        });
      }
    });
  };

  const handleDeleteAccount = () => {
    startTransition(async () => {
      await deleteAccount();
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dark frappe min-h-screen flex items-center justify-center bg-ctp-base p-4">
      <div className="w-full max-w-2xl bg-ctp-mantle backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-ctp-subtext0 hover:text-ctp-text transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-ctp-text mb-6">
            Profile Settings
          </h1>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-ctp-green/20 text-ctp-green"
                  : "bg-ctp-red/20 text-ctp-red"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-2 mb-6 border-b border-ctp-surface0">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-ctp-lavender border-b-2 border-ctp-lavender"
                  : "text-ctp-subtext0 hover:text-ctp-text"
              }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sessions")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "sessions"
                  ? "text-ctp-lavender border-b-2 border-ctp-lavender"
                  : "text-ctp-subtext0 hover:text-ctp-text"
              }`}
            >
              Sessions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("danger")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "danger"
                  ? "text-ctp-red border-b-2 border-ctp-red"
                  : "text-ctp-subtext0 hover:text-ctp-text"
              }`}
            >
              Danger Zone
            </button>
          </div>

          {activeTab === "profile" && (
            <div className="space-y-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-ctp-subtext0 mb-1"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-ctp-surface0 text-ctp-text rounded-lg border border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-ctp-subtext0 mb-1"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-ctp-surface0 text-ctp-text rounded-lg border border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-ctp-subtext0 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-ctp-surface0 text-ctp-text rounded-lg border border-ctp-surface1 focus:border-ctp-lavender focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full px-6 py-3 bg-ctp-lavender hover:bg-ctp-lavender/80 text-ctp-base font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </form>

              <div className="pt-4 border-t border-ctp-surface0">
                <h3 className="text-lg font-medium text-ctp-text mb-3">
                  Connected OAuth Methods
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.oauth_methods.map((method) => (
                    <span
                      key={method}
                      className="px-3 py-1 bg-ctp-surface0 text-ctp-text rounded-full text-sm capitalize"
                    >
                      {method}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-ctp-subtext0">
                  To link another OAuth provider, sign in with it from the login
                  page. It will automatically be added to your account.
                </p>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-4">
              <p className="text-ctp-subtext0 text-sm mb-4">
                Manage your active sessions. Revoking a session will log you out
                from that device.
              </p>
              {sessions.length === 0 ? (
                <p className="text-ctp-subtext0">No active sessions found.</p>
              ) : (
                sessions.map((session) => {
                  const isCurrentSession =
                    session.token === currentSessionToken;
                  return (
                    <div
                      key={session._id}
                      className={`p-4 bg-ctp-surface0 rounded-lg ${isCurrentSession ? "ring-2 ring-ctp-green" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-ctp-text font-medium">
                              {session.userAgent.split(" ")[0] ||
                                "Unknown Device"}
                            </span>
                            {isCurrentSession && (
                              <span className="px-2 py-0.5 bg-ctp-green/20 text-ctp-green text-xs rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ctp-subtext0">
                            IP: {session.ipAddress}
                          </p>
                          <p className="text-sm text-ctp-subtext0">
                            Expires: {formatDate(session.expiresAt)}
                          </p>
                        </div>
                        {!isCurrentSession && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(session._id)}
                            disabled={isPending}
                            className="px-3 py-1 bg-ctp-red/20 text-ctp-red hover:bg-ctp-red/30 rounded-lg text-sm transition-colors disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-4">
              <div className="p-4 bg-ctp-red/10 border border-ctp-red/30 rounded-lg">
                <h3 className="text-lg font-medium text-ctp-red mb-2">
                  Delete Account
                </h3>
                <p className="text-ctp-subtext0 text-sm mb-4">
                  This action is irreversible. All your data will be permanently
                  deleted.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-ctp-red hover:bg-ctp-red/80 text-ctp-base font-semibold rounded-lg transition-colors"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-ctp-red font-medium">
                      Are you absolutely sure?
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isPending}
                        className="px-4 py-2 bg-ctp-red hover:bg-ctp-red/80 text-ctp-base font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isPending ? "Deleting..." : "Yes, Delete Everything"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isPending && (
        <div className="fixed inset-0 bg-ctp-base/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-ctp-lavender/40 border-t-ctp-mauve rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
