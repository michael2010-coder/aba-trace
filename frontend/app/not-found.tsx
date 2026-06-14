import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 py-24 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Not found</h1>
      <p className="max-w-sm text-sm text-zinc-600">
        We couldn&apos;t find what you&apos;re looking for. The passport may not exist, or the link may be
        incorrect.
      </p>
      <Link
        href="/"
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Back to home
      </Link>
    </div>
  );
}
