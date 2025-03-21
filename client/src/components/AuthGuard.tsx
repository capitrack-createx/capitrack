// src/components/AuthGuard.tsx
import { Redirect } from "wouter";
import { useAuth } from "@/services/auth-service";
import React from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
