'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { CheckCircleIcon, ClockIcon, PackageIcon, PackagePlusIcon, QrCodeIcon } from '@/components/icons';
import { PassportIllustration } from '@/components/illustrations';

interface Artisan {
  artisanId: string;
  fullName: string;
  businessName: string;
  businessType: string;
  lga: string;
  ninVerified: boolean;
}

interface Passport {
  passportId: string;
  productName: string;
  batchId: string;
  quantityInBatch: number;
  issuedAt: string;
  status: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const router = useRouter();

  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [passports, setPassports] = useState<Passport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrBusyId, setQrBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    (async () => {
      try {
        const token = await getIdToken();
        const [profile, passportList] = await Promise.all([
          api.get<Artisan>('/artisans/me', token),
          api.get<{ passports: Passport[] }>('/artisans/me/passports', token),
        ]);
        setArtisan(profile);
        setPassports(passportList.passports);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) {
          router.push('/register');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, getIdToken, router]);

  async function handleViewQrCode(passportId: string) {
    setError(null);
    setQrBusyId(passportId);
    try {
      const token = await getIdToken();
      const { qrCodeUrl } = await api.get<{ qrCodeUrl: string }>(
        `/artisans/me/passports/${passportId}/qr-code`,
        token
      );
      window.open(qrCodeUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QR code');
    } finally {
      setQrBusyId(null);
    }
  }

  if (authLoading || loading) {
    return <div className="flex flex-1 items-center justify-center p-12 text-zinc-500">Loading…</div>;
  }

  return (
    <div className="flex-1 bg-zinc-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-b from-amber-50 via-zinc-50 to-zinc-50">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 pb-4 pt-10 sm:flex-row sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
              Welcome back{artisan ? `, ${artisan.businessName}` : ''}
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Manage your business profile and digital product passports.
            </p>
          </div>
          <PassportIllustration className="h-28 w-28 shrink-0 sm:h-32 sm:w-32" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 py-8">
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {artisan && (
        <div className="mb-8 flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-semibold text-white">
            {artisan.businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{artisan.businessName}</h2>
            <p className="text-sm text-zinc-600">
              {artisan.fullName} &middot; {artisan.businessType} &middot; {artisan.lga}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm">
              {artisan.ninVerified ? (
                <span className="flex items-center gap-1.5 font-medium text-green-700">
                  <CheckCircleIcon className="h-4 w-4" />
                  NIN verified
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-amber-700">
                  <ClockIcon className="h-4 w-4" />
                  NIN pending verification
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Your passports</h2>
        <Link
          href="/passports/new"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + New passport
        </Link>
      </div>

      {passports.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <PackagePlusIcon className="h-10 w-10 text-zinc-400" />
          <p className="text-sm text-zinc-500">No passports issued yet. Create your first one to get started.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {passports.map((p) => (
            <li key={p.passportId} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <PackageIcon className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
                  <div>
                    <p className="font-medium text-zinc-900">{p.productName}</p>
                    <p className="text-sm text-zinc-500">
                      Batch {p.batchId} &middot; Qty {p.quantityInBatch} &middot;{' '}
                      {new Date(p.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.status === 'amended' && (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                      Amended
                    </span>
                  )}
                  <button
                    onClick={() => handleViewQrCode(p.passportId)}
                    disabled={qrBusyId === p.passportId}
                    className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 underline disabled:opacity-50"
                  >
                    <QrCodeIcon className="h-4 w-4" />
                    {qrBusyId === p.passportId ? 'Loading…' : 'QR code'}
                  </button>
                  <Link href={`/p/${p.passportId}`} className="text-sm font-medium text-zinc-900 underline">
                    View
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
