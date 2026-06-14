'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import { ArtisanStitchingIllustration, PassportIllustration } from '@/components/illustrations';

interface CreatedPassport {
  passportId: string;
  qrCodeUrl: string;
  publicUrl: string;
}

export default function NewPassportPage() {
  const { user, loading: authLoading, getIdToken } = useAuth();
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [batchId, setBatchId] = useState('');
  const [materials, setMaterials] = useState('');
  const [quantityInBatch, setQuantityInBatch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<CreatedPassport | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await getIdToken();
      const result = await api.post<CreatedPassport>(
        '/passports',
        {
          productName,
          batchId,
          materials: materials
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean),
          quantityInBatch: Number(quantityInBatch),
        },
        token
      );
      setCreated(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create passport');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <div className="flex flex-1 items-center justify-center p-12 text-zinc-500">Loading…</div>;
  }

  if (created) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 px-6 py-16 text-center">
        <PassportIllustration className="h-40 w-40" />
        <h1 className="text-2xl font-bold text-zinc-900">Passport created</h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static asset */}
        <img src={created.qrCodeUrl} alt="QR code" className="h-64 w-64 rounded border border-zinc-200" />
        <p className="text-sm text-zinc-600 break-all">{created.publicUrl}</p>
        <div className="flex gap-3">
          <a
            href={created.qrCodeUrl}
            download
            className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Download QR
          </a>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-10 bg-zinc-50 px-6 py-16 lg:flex-row lg:gap-16">
      <ArtisanStitchingIllustration className="hidden w-full max-w-xs shrink-0 lg:block" />
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">Create a new passport</h1>

        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Product name
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Hand-stitched Leather Loafer"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Batch ID
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="AT-2026-08114"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Materials (comma-separated)
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="Goat leather, Rubber sole"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Quantity in batch
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
              type="number"
              min="1"
              value={quantityInBatch}
              onChange={(e) => setQuantityInBatch(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create passport'}
          </button>
        </form>
      </div>
    </div>
  );
}
