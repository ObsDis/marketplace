"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DriverProfile {
  displayName: string;
  bio: string;
  phone: string;
  vanInfo: string;
  licensePlate: string;
  serviceAreas: string[];
  stripeAccountId: string | null;
  stripeAccountReady: boolean;
}

export default function DriverSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    phone: "",
    vanInfo: "",
    licensePlate: "",
    serviceAreas: "",
  });
  const [stripeStatus, setStripeStatus] = useState<{
    connected: boolean;
    ready: boolean;
  }>({ connected: false, ready: false });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/drivers/me");
        if (res.status === 401) {
          router.push("/auth/signin");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data: DriverProfile = await res.json();
        setForm({
          displayName: data.displayName || "",
          bio: data.bio || "",
          phone: data.phone || "",
          vanInfo: data.vanInfo || "",
          licensePlate: data.licensePlate || "",
          serviceAreas: (data.serviceAreas || []).join(", "),
        });
        setStripeStatus({
          connected: !!data.stripeAccountId,
          ready: data.stripeAccountReady,
        });
      } catch {
        setMessage({ type: "error", text: "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/drivers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          bio: form.bio,
          phone: form.phone,
          vanInfo: form.vanInfo,
          licensePlate: form.licensePlate,
          serviceAreas: form.serviceAreas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectStripe() {
    setConnectingStripe(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to connect");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setMessage({
        type: "error",
        text: "Failed to initiate Stripe connection.",
      });
      setConnectingStripe(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Driver Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update your profile and payment settings.
            </p>
          </div>
          <Link
            href="/dashboard/driver"
            className="text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {message && (
          <div
            className={`mt-6 rounded-lg px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="mt-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Tell customers about yourself..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  License Plate
                </label>
                <input
                  type="text"
                  value={form.licensePlate}
                  onChange={(e) =>
                    setForm({ ...form, licensePlate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Van Info
                </label>
                <input
                  type="text"
                  value={form.vanInfo}
                  onChange={(e) =>
                    setForm({ ...form, vanInfo: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. 2023 Ford Transit"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Service Areas
                </label>
                <input
                  type="text"
                  value={form.serviceAreas}
                  onChange={(e) =>
                    setForm({ ...form, serviceAreas: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. Los Angeles, Orange County, San Diego"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Separate areas with commas.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>

        {/* Stripe Connect */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Connect your Stripe account to receive payments directly.
          </p>
          <div className="mt-4">
            {stripeStatus.connected ? (
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    stripeStatus.ready
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {stripeStatus.ready
                    ? "Stripe Connected"
                    : "Setup In Progress"}
                </span>
                {!stripeStatus.ready && (
                  <p className="text-xs text-gray-500">
                    Please complete your Stripe onboarding to receive payments.
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnectStripe}
                disabled={connectingStripe}
                className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
              >
                {connectingStripe
                  ? "Redirecting..."
                  : "Connect Stripe Account"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
