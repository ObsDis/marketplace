"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RideConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    baseFare: "",
    perMileRate: "",
    perMinRate: "",
    surgeMultiplier: "",
    serviceArea: "",
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/merchants/me");
        if (res.status === 401) {
          router.push("/auth/signin");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch merchant data");

        const data = await res.json();
        const config = data.rideConfig;
        if (config) {
          setForm({
            baseFare: config.baseFare?.toString() || "",
            perMileRate: config.perMileRate?.toString() || "",
            perMinRate: config.perMinRate?.toString() || "",
            surgeMultiplier: config.surgeMultiplier?.toString() || "1",
            serviceArea: config.serviceArea || "",
          });
        }
      } catch {
        setError("Failed to load ride configuration");
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (!form.baseFare || parseFloat(form.baseFare) < 0) {
      setError("Base fare must be zero or greater");
      setSaving(false);
      return;
    }

    if (!form.perMileRate || parseFloat(form.perMileRate) < 0) {
      setError("Per-mile rate must be zero or greater");
      setSaving(false);
      return;
    }

    if (!form.perMinRate || parseFloat(form.perMinRate) < 0) {
      setError("Per-minute rate must be zero or greater");
      setSaving(false);
      return;
    }

    const surge = parseFloat(form.surgeMultiplier || "1");
    if (surge < 1) {
      setError("Surge multiplier must be at least 1.0");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/merchants/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideConfig: {
            baseFare: parseFloat(form.baseFare),
            perMileRate: parseFloat(form.perMileRate),
            perMinRate: parseFloat(form.perMinRate),
            surgeMultiplier: surge,
            serviceArea: form.serviceArea.trim() || undefined,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save configuration");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const baseFare = parseFloat(form.baseFare) || 0;
  const perMile = parseFloat(form.perMileRate) || 0;
  const perMin = parseFloat(form.perMinRate) || 0;
  const surge = parseFloat(form.surgeMultiplier) || 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading ride configuration...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Ride Share Configuration
          </h1>
          <p className="text-gray-500 mt-1">
            Set your pricing and service area for ride share
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg text-sm font-medium bg-green-50 text-green-800 border border-green-200">
            Ride configuration saved successfully
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Pricing Settings
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="baseFare"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Base Fare ($) *
                </label>
                <input
                  type="number"
                  id="baseFare"
                  name="baseFare"
                  value={form.baseFare}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="surgeMultiplier"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Surge Multiplier *
                </label>
                <input
                  type="number"
                  id="surgeMultiplier"
                  name="surgeMultiplier"
                  value={form.surgeMultiplier}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="perMileRate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Per Mile Rate ($) *
                </label>
                <input
                  type="number"
                  id="perMileRate"
                  name="perMileRate"
                  value={form.perMileRate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="perMinRate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Per Minute Rate ($) *
                </label>
                <input
                  type="number"
                  id="perMinRate"
                  name="perMinRate"
                  value={form.perMinRate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="serviceArea"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Service Area
              </label>
              <input
                type="text"
                id="serviceArea"
                name="serviceArea"
                value={form.serviceArea}
                onChange={handleChange}
                placeholder="e.g. Greater Austin Area, Dallas-Fort Worth Metroplex"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Define the geographic area where you provide rides
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/merchant"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>

        {/* Pricing Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pricing Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Base Fare</span>
              <span className="text-sm font-medium text-gray-900">
                ${baseFare.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Per Mile</span>
              <span className="text-sm font-medium text-gray-900">
                ${perMile.toFixed(2)} / mile
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Per Minute</span>
              <span className="text-sm font-medium text-gray-900">
                ${perMin.toFixed(2)} / min
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Surge Multiplier</span>
              <span className="text-sm font-medium text-gray-900">
                {surge.toFixed(1)}x
              </span>
            </div>
            {form.serviceArea && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Service Area</span>
                <span className="text-sm font-medium text-gray-900">
                  {form.serviceArea}
                </span>
              </div>
            )}
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">Example (5 miles, 15 min):</span>{" "}
                ${((baseFare + perMile * 5 + perMin * 15) * surge).toFixed(2)}
                {surge > 1 && (
                  <span className="text-indigo-600">
                    {" "}
                    (with {surge.toFixed(1)}x surge)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
