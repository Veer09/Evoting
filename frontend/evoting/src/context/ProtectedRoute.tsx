"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  roleRequired?: 'voter' | 'electionCommittee';
}

export default function ProtectedRoute({ children, roleRequired }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login/voter');
      } else if (roleRequired && user.role !== roleRequired) {
        if (user.role === 'voter') {
          router.push('/dashboard/voter');
        } else if (user.role === 'electionCommittee') {
          router.push('/dashboard/committee');
        }
      }
    }
  }, [user, loading, router, roleRequired]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (roleRequired && user.role !== roleRequired) {
    return null;
  }

  return <>{children}</>;
}