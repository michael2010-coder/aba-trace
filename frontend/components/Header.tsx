'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Header() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-zinc-900">
          ABA TRACE
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-600">
          {loading ? null : user ? (
            <>
              <Link href="/dashboard" className="hover:text-zinc-900">
                Dashboard
              </Link>
              {user.isAdmin && (
                <Link href="/admin" className="hover:text-zinc-900">
                  Admin
                </Link>
              )}
              <button onClick={signOut} className="hover:text-zinc-900">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
