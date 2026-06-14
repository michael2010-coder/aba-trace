'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

const LGAS = [
  'Aba North',
  'Aba South',
  'Arochukwu',
  'Bende',
  'Ikwuano',
  'Isiala Ngwa North',
  'Isiala Ngwa South',
  'Isuikwuato',
  'Obi Ngwa',
  'Ohafia',
  'Osisioma',
  'Ugwunagbo',
  'Ukwa East',
  'Ukwa West',
  'Umuahia North',
  'Umuahia South',
  'Umu Nneochi',
];
const BUSINESS_TYPES = ['Footwear', 'Leather Goods', 'Garments', 'Other'];

export default function RegisterPage() {
  const { signUp, confirmSignUp, signIn, getIdToken } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'account' | 'confirm' | 'profile'>('account');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [code, setCode] = useState('');

  // Profile fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ninNumber, setNinNumber] = useState('');
  const [lga, setLga] = useState(LGAS[0]);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [ninSlip, setNinSlip] = useState<File | null>(null);

  async function handleAccountSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      await signIn(email, password);
      setStep('profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await getIdToken();
      await api.post(
        '/artisans/register',
        {
          fullName,
          phoneNumber,
          ninNumber,
          lga,
          businessName,
          businessType,
          materialsUsed: materialsUsed
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean),
        },
        token
      );

      if (ninSlip) {
        const { uploadUrl } = await api.post<{ uploadUrl: string; key: string }>(
          '/artisans/me/nin-upload-url',
          { contentType: ninSlip.type },
          token
        );
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': ninSlip.type },
          body: ninSlip,
        });
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-zinc-900">
          {step === 'account' && 'Create your account'}
          {step === 'confirm' && 'Verify your email'}
          {step === 'profile' && 'Your business details'}
        </h1>

        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {step === 'account' && (
          <form onSubmit={handleAccountSubmit} className="flex flex-col gap-4">
            <Field label="Full name" value={fullName} onChange={setFullName} required />
            <Field label="Email" type="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required />
            <p className="text-xs text-zinc-500">
              At least 8 characters, with uppercase, lowercase, and a digit.
            </p>
            <SubmitButton loading={loading}>Sign up</SubmitButton>
          </form>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-zinc-600">
              We sent a verification code to <strong>{email}</strong>.
            </p>
            <Field label="Verification code" value={code} onChange={setCode} required />
            <SubmitButton loading={loading}>Verify</SubmitButton>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <Field label="Phone number" value={phoneNumber} onChange={setPhoneNumber} required />
            <Field label="NIN number" value={ninNumber} onChange={setNinNumber} required />
            <SelectField label="LGA" value={lga} onChange={setLga} options={LGAS} />
            <Field label="Business name" value={businessName} onChange={setBusinessName} required />
            <SelectField label="Business type" value={businessType} onChange={setBusinessType} options={BUSINESS_TYPES} />
            <Field
              label="Materials used (comma-separated)"
              value={materialsUsed}
              onChange={setMaterialsUsed}
              placeholder="Goat leather, Rubber sole"
            />
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
              Photo of your NIN slip (optional)
              <input
                className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(e) => setNinSlip(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="text-xs text-zinc-500">
              Your NIN will be manually verified by an admin before it is marked verified.
            </p>
            <SubmitButton loading={loading}>Complete registration</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
      {label}
      <input
        className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
      {label}
      <select
        className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubmitButton({ children, loading }: { children: React.ReactNode; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}
