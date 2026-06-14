import { notFound } from 'next/navigation';
import { config } from '@/lib/config';
import VerifyButton from './VerifyButton';
import { PackageIcon, ShieldCheckIcon } from '@/components/icons';
import { ArtisanHandoffIllustration } from '@/components/illustrations';

interface PassportView {
  passportId: string;
  productName: string;
  batchId: string;
  materials: string[];
  lgaOfOrigin: string;
  quantityInBatch: number;
  issuedAt: string;
  status: string;
  makerName: string;
  original?: Record<string, unknown>;
  amendments: { entryId: string; createdAt: string; payload: Record<string, unknown> }[];
}

async function getPassport(passportId: string): Promise<PassportView | null> {
  const res = await fetch(`${config.apiUrl}/passports/${passportId}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load passport');
  return res.json();
}

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ passportId: string }>;
}) {
  const { passportId } = await params;
  const passport = await getPassport(passportId);
  if (!passport) notFound();

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <ArtisanHandoffIllustration className="mx-auto mb-6 w-full max-w-sm" />
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <PackageIcon className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">{passport.productName}</h1>
          </div>
          {passport.status === 'amended' ? (
            <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Amended
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Active
            </span>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <Field label="Maker" value={passport.makerName} />
          <Field label="LGA of origin" value={passport.lgaOfOrigin} />
          <Field label="Batch ID" value={passport.batchId} />
          <Field label="Quantity in batch" value={String(passport.quantityInBatch)} />
          <Field label="Materials" value={passport.materials.join(', ')} span />
          <Field label="Issued" value={new Date(passport.issuedAt).toLocaleDateString()} />
        </dl>

        {passport.status === 'amended' && passport.amendments.length > 0 && (
          <div className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-medium text-amber-900">This record was corrected after issuance.</p>
            {passport.amendments.map((a) => (
              <div key={a.entryId} className="mt-2 text-amber-800">
                <p>{new Date(a.createdAt).toLocaleDateString()}: {String(a.payload.reason)}</p>
                <p className="text-xs">
                  Corrected fields: {JSON.stringify(a.payload.changes)}
                </p>
              </div>
            ))}
            {passport.original && (
              <details className="mt-2">
                <summary className="cursor-pointer text-amber-900 underline">View original entry</summary>
                <pre className="mt-2 overflow-x-auto text-xs">{JSON.stringify(passport.original, null, 2)}</pre>
              </details>
            )}
          </div>
        )}

        <VerifyButton passportId={passport.passportId} />
      </div>
    </div>
  );
}

function Field({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? 'col-span-2' : undefined}>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </div>
  );
}
