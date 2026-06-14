'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface VerifyResult {
  valid: boolean;
  entriesChecked: number;
  brokenAtSequence?: number;
  createdAt?: string;
  amended: boolean;
  amendments: { createdAt: string; reason?: string }[];
}

export default function VerifyButton({ passportId }: { passportId: string }) {
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<VerifyResult>(`/passports/${passportId}/verify`);
      setResult(data);
    } catch {
      setError('Could not reach the verification service.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Verify on ledger'}
      </button>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {result && (
        <div className="mt-3 rounded bg-zinc-50 p-3 text-sm text-zinc-700">
          {result.valid ? (
            <p>
              This record was created on{' '}
              {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'an unknown date'} and has
              not been tampered with. ✓ ({result.entriesChecked} ledger entries checked)
              {result.amended && ' This record was later corrected — see above.'}
            </p>
          ) : (
            <p className="text-red-700">
              Verification failed at ledger entry {result.brokenAtSequence}. This record may have been tampered
              with.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
