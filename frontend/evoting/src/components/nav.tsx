"use client";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";

const Nav = () => {
  const { user } = useAuth();
  const isVoter = user?.role === "voter";
  const isLoggedIn = !!user;

  return (
    <nav className="flex items-center gap-4">
      {isLoggedIn ? (
        <>
          {isVoter ? (
            <Link href="/dashboard/voter">
              <Button variant="ghost">Voter Dashboard</Button>
            </Link>
          ) : (
            <Link href="/dashboard/committee">
              <Button variant="ghost">Committee Dashboard</Button>
            </Link>
          )}
        </>
      ) : (
        <>
          <Link href="/login/voter">
            <Button variant="ghost">Voter Login</Button>
          </Link>
          <Link href="/login/committee">
            <Button variant="ghost">Committee Login</Button>
          </Link>
        </>
      )}
    </nav>
  );
};

export default Nav;
