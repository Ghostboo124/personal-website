"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/auth/logout");
    router.refresh();
    router.push("/");
  };

  return (
    <Button
      variant="outline"
      className="text-lg bg-ctp-mantle text-ctp-mauve"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
