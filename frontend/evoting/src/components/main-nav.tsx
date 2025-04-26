"use client";
import Link from "next/link";
import { Vote } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MainNav() {
  const { user } = useAuth();
  const isVoter = user?.role === "voter";
  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Link href="/" className="flex items-center gap-2">
        <Vote className="h-6 w-6" />
        <span className="font-bold">EVote</span>
      </Link>
      {isVoter && (
        <Link
          href="/dashboard/voter"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
      )}
      {!isVoter && (
        <Link
          href="/dashboard/committee"
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          Dashboard
        </Link>
      )}
    </div>
  );
}
