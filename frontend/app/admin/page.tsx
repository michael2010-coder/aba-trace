'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

interface Artisan {
  artisanId: string;
  fullName: string;
  businessName: string;
  lga: string;
  ninNumber: string;
  ninVerified: boolean;
  ninDocumentKey?: string | null;
}

interface DashboardStats {
  artisansRegistered: number;
  artisansNinVerified: number;
  passportsIssued: number;
  passportsAmended: number;
  artisansByLga: Record<string, number>;
}

export default function AdminPage() {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pending, setPending] = useState<Artisan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyArtisanId, setBusyArtisanId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = await getIdToken();
    const [statsResult, artisansResult] = await Promise.all([
      api.get<DashboardStats>('/admin/dashboard-stats', token),
      api.get<{ artisans: Artisan[]; pendingNinVerification: Artisan[] }>('/admin/artisans', token),
    ]);
    setStats(statsResult);
    setPending(artisansResult.pendingNinVerification);
  }, [getIdToken]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (!user.isAdmin) {
      router.push('/dashboard');
      return;
    }
    (async () => {
      try {
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, router, load]);

  async function handleVerify(artisanId: string, approve: boolean) {
    setError(null);
    setActionMessage(null);
    setBusyArtisanId(artisanId);
    try {
      const token = await getIdToken();
      await api.post(`/admin/artisans/${artisanId}/verify-nin`, { approve }, token);
      await load();
      setActionMessage(approve ? 'Artisan marked as NIN verified.' : 'Artisan NIN verification rejected.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update NIN verification');
    } finally {
      setBusyArtisanId(null);
    }
  }

  async function handleViewNinSlip(artisanId: string) {
    setError(null);
    setBusyArtisanId(artisanId);
    try {
      const token = await getIdToken();
      const { url } = await api.get<{ url: string }>(`/admin/artisans/${artisanId}/nin-document-url`, token);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load NIN slip');
    } finally {
      setBusyArtisanId(null);
    }
  }

  if (authLoading || loading) {
    return <div className="flex flex-1 items-center justify-center p-12 text-zinc-500">Loading…</div>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">Admin dashboard</h1>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {actionMessage && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">{actionMessage}</p>}

      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Artisans registered" value={stats.artisansRegistered} />
          <Stat label="NIN verified" value={stats.artisansNinVerified} />
          <Stat label="Passports issued" value={stats.passportsIssued} />
          <Stat label="Passports amended" value={stats.passportsAmended} />
        </div>
      )}

      {stats && Object.keys(stats.artisansByLga).length > 0 && (
        <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-zinc-900">Artisans by LGA</h2>
          <ul className="text-sm text-zinc-700">
            {Object.entries(stats.artisansByLga).map(([lga, count]) => (
              <li key={lga}>
                {lga}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-zinc-900">NIN verification queue</h2>
      {pending.length === 0 ? (
        <p className="text-sm text-zinc-500">No artisans pending NIN verification.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pending.map((a) => {
            const busy = busyArtisanId === a.artisanId;
            return (
              <li key={a.artisanId} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{a.businessName}</p>
                    <p className="text-sm text-zinc-500">
                      {a.fullName} &middot; {a.lga} &middot; NIN: {a.ninNumber}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.ninDocumentKey && (
                      <button
                        onClick={() => handleViewNinSlip(a.artisanId)}
                        disabled={busy}
                        className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
                      >
                        {busy ? 'Working…' : 'View NIN slip'}
                      </button>
                    )}
                    <button
                      onClick={() => handleVerify(a.artisanId, true)}
                      disabled={busy}
                      className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(a.artisanId, false)}
                      disabled={busy}
                      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
