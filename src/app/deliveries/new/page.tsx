"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const packageSizes = [
  { value: "ENVELOPE", label: "Envelope" },
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
  { value: "EXTRA_LARGE", label: "Extra Large" },
  { value: "PALLET", label: "Pallet" },
];

export default function NewDeliveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    packageSize: "MEDIUM",
    packageWeight: "",
    packageCount: "1",
    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    pickupZip: "",
    pickupContact: "",
    pickupPhone: "",
    pickupNotes: "",
    dropoffAddress: "",
    dropoffCity: "",
    dropoffState: "",
    dropoffZip: "",
    dropoffContact: "",
    dropoffPhone: "",
    dropoffNotes: "",
    price: "",
    scheduledDate: "",
  });

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        packageSize: form.packageSize,
        packageWeight: form.packageWeight
          ? parseFloat(form.packageWeight)
          : undefined,
        packageCount: parseInt(form.packageCount) || 1,
        pickupAddress: form.pickupAddress,
        pickupCity: form.pickupCity,
        pickupState: form.pickupState,
        pickupZip: form.pickupZip,
        pickupContact: form.pickupContact || undefined,
        pickupPhone: form.pickupPhone || undefined,
        pickupNotes: form.pickupNotes || undefined,
        dropoffAddress: form.dropoffAddress,
        dropoffCity: form.dropoffCity,
        dropoffState: form.dropoffState,
        dropoffZip: form.dropoffZip,
        dropoffContact: form.dropoffContact || undefined,
        dropoffPhone: form.dropoffPhone || undefined,
        dropoffNotes: form.dropoffNotes || undefined,
        price: parseFloat(form.price),
        scheduledDate: form.scheduledDate
          ? new Date(form.scheduledDate).toISOString()
          : undefined,
      };

      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create delivery");
      }

      const delivery = await res.json();
      router.push(`/deliveries/${delivery.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a Delivery</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below and a driver will accept your job.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Delivery Details
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Furniture delivery to downtown"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Any additional details about the delivery..."
                />
              </div>
            </div>
          </div>

          {/* Package Info */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Package Information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Package Size</label>
                <select
                  value={form.packageSize}
                  onChange={(e) => updateForm("packageSize", e.target.value)}
                  className={inputClass}
                >
                  {packageSizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Weight (lbs)</label>
                <input
                  type="number"
                  value={form.packageWeight}
                  onChange={(e) => updateForm("packageWeight", e.target.value)}
                  className={inputClass}
                  placeholder="Optional"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className={labelClass}>Package Count</label>
                <input
                  type="number"
                  value={form.packageCount}
                  onChange={(e) => updateForm("packageCount", e.target.value)}
                  className={inputClass}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Pickup */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Pickup Location
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={form.pickupAddress}
                  onChange={(e) => updateForm("pickupAddress", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  value={form.pickupCity}
                  onChange={(e) => updateForm("pickupCity", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    value={form.pickupState}
                    onChange={(e) => updateForm("pickupState", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>ZIP</label>
                  <input
                    type="text"
                    value={form.pickupZip}
                    onChange={(e) => updateForm("pickupZip", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Contact Name</label>
                <input
                  type="text"
                  value={form.pickupContact}
                  onChange={(e) => updateForm("pickupContact", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={form.pickupPhone}
                  onChange={(e) => updateForm("pickupPhone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Notes</label>
                <input
                  type="text"
                  value={form.pickupNotes}
                  onChange={(e) => updateForm("pickupNotes", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Ring doorbell, loading dock at rear"
                />
              </div>
            </div>
          </div>

          {/* Dropoff */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Dropoff Location
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  value={form.dropoffAddress}
                  onChange={(e) => updateForm("dropoffAddress", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  value={form.dropoffCity}
                  onChange={(e) => updateForm("dropoffCity", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>State</label>
                  <input
                    type="text"
                    value={form.dropoffState}
                    onChange={(e) => updateForm("dropoffState", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>ZIP</label>
                  <input
                    type="text"
                    value={form.dropoffZip}
                    onChange={(e) => updateForm("dropoffZip", e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Contact Name</label>
                <input
                  type="text"
                  value={form.dropoffContact}
                  onChange={(e) => updateForm("dropoffContact", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={form.dropoffPhone}
                  onChange={(e) => updateForm("dropoffPhone", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Notes</label>
                <input
                  type="text"
                  value={form.dropoffNotes}
                  onChange={(e) => updateForm("dropoffNotes", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Leave at front door"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Schedule */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Budget & Schedule
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Your Budget ($)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 150.00"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Scheduled Date (optional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledDate}
                  onChange={(e) => updateForm("scheduledDate", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
