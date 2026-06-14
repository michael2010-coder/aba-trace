import Link from "next/link";
import { PackagePlusIcon, QrCodeIcon, ShieldCheckIcon } from "@/components/icons";
import { CraftsmanIllustration, PassportIllustration, VerifyScanIllustration } from "@/components/illustrations";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans">
      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-50 via-zinc-50 to-zinc-50">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-16 sm:py-24 lg:flex-row lg:gap-16">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">ABA TRACE</h1>
            <p className="max-w-md text-lg leading-7 text-zinc-600">
              Digital product passports for artisans in Aba South. Every item gets a
              tamper-evident record of who made it, where, and from what materials —
              verifiable by anyone with a QR code scan.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-zinc-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700"
              >
                Register as an artisan
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                Sign in
              </Link>
            </div>
          </div>
          <CraftsmanIllustration className="w-full max-w-md drop-shadow-sm lg:max-w-lg" />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold text-zinc-900 sm:text-3xl">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-zinc-600">
          From the workshop to the customer&apos;s hand, every product carries proof of its
          origin in Aba.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <PackagePlusIcon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">1. Register &amp; create</h3>
            <p className="text-sm text-zinc-600">
              Artisans register their business and issue a digital passport for each
              product batch — capturing materials, batch ID, and origin.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white">
              <ShieldCheckIcon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">2. Secure on the ledger</h3>
            <p className="text-sm text-zinc-600">
              Each passport is recorded in a tamper-evident hash chain, and a unique QR
              code is generated for the product.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
              <QrCodeIcon className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">3. Scan &amp; verify</h3>
            <p className="text-sm text-zinc-600">
              Anyone can scan the QR code to view the product&apos;s record and confirm it
              hasn&apos;t been tampered with.
            </p>
          </div>
        </div>
      </section>

      {/* Passport + Verify showcase */}
      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">A passport for every product</h2>
            <p className="max-w-md text-zinc-600">
              Each item gets its own digital record — maker, materials, batch, and
              issue date — anchored to a cryptographic ledger so it can&apos;t be quietly
              edited later.
            </p>
          </div>
          <PassportIllustration className="mx-auto w-full max-w-xs" />
        </div>
      </section>

      <section className="bg-zinc-50">
        <div className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <VerifyScanIllustration className="mx-auto w-full max-w-xs lg:order-2" />
          <div className="flex flex-col items-center gap-4 text-center lg:order-1 lg:items-start lg:text-left">
            <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Built on trust, verified instantly</h2>
            <p className="max-w-md text-zinc-600">
              Customers, buyers, and inspectors can scan any ABA TRACE QR code to see
              the full history of a product and confirm its authenticity in seconds —
              no account required.
            </p>
            <Link
              href="/register"
              className="rounded-full bg-zinc-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
