"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Role = "CUSTOMER" | "DRIVER";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const isDriver = role === "DRIVER";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (isDriver && !displayName.trim()) {
      setError("Display name is required for drivers.");
      return;
    }

    setLoading(true);

    try {
      // Use Supabase client signUp — this triggers the built-in confirmation email
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, displayName: isDriver ? displayName : undefined },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${isDriver ? "/dashboard/driver" : "/marketplace"}`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // If Supabase returns a user but identities is empty, account already exists
      if (data.user && data.user.identities?.length === 0) {
        setError("An account with this email already exists.");
        return;
      }

      setConfirmationSent(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition";

  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Check Your Email</h1>
            <p className="mt-3 text-sm text-gray-600">
              We sent a confirmation link to <span className="font-semibold text-gray-900">{email}</span>.
              Click the link to verify your account, then sign in.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 transition"
            >
              Go to Sign In
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              Didn&apos;t receive it? Check your spam folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-sm text-gray-500">
              Join Sprint Cargo today
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClasses}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClasses}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClasses}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClasses}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="role" className={labelClasses}>
                Account Type
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={inputClasses}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="DRIVER">Driver</option>
              </select>
            </div>

            {isDriver && (
              <div>
                <label htmlFor="displayName" className={labelClasses}>
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="Your driver display name"
                  className={inputClasses}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="font-semibold text-orange-600 hover:text-orange-500 transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
