"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RateCardForm {
  baseRate: string;
  perMileRate: string;
  surgSmall: string;
  surgMedium: string;
  surgLarge: string;
  surgXL: string;
  surgXXL: string;
  surgPallet: string;
  surgWeightLight: string;
  surgWeightMedium: string;
  surgWeightHeavy: string;
  surgWeightExtraHeavy: string;
  perExtraItem: string;
  premiumSameDay: string;
  premiumRush: string;
}

const defaults: RateCardForm = {
  baseRate: "25",
  perMileRate: "1.50",
  surgSmall: "0",
  surgMedium: "0",
  surgLarge: "25",
  surgXL: "50",
  surgXXL: "100",
  surgPallet: "200",
  surgWeightLight: "0",
  surgWeightMedium: "15",
  surgWeightHeavy: "35",
  surgWeightExtraHeavy: "75",
  perExtraItem: "10",
  premiumSameDay: "25",
  premiumRush: "50",
};

export default function RateCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState<RateCardForm>(defaults);

  useEffect(() => {
    async function fetchRateCard() {
      try {
        const res = await fetch("/api/drivers/me/rate-card");
        if (res.status === 401) {
          router.push("/auth/signin");
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setIsNew(false);
            setForm({
              baseRate: String(data.baseRate),
              perMileRate: String(data.perMileRate),
              surgSmall: String(data.surgSmall),
              surgMedium: String(data.surgMedium),
              surgLarge: String(data.surgLarge),
              surgXL: String(data.surgXL),
              surgXXL: String(data.surgXXL),
              surgPallet: String(data.surgPallet),
              surgWeightLight: String(data.surgWeightLight),
              surgWeightMedium: String(data.surgWeightMedium),
              surgWeightHeavy: String(data.surgWeightHeavy),
              surgWeightExtraHeavy: String(data.surgWeightExtraHeavy),
              perExtraItem: String(data.perExtraItem),
              premiumSameDay: String(data.premiumSameDay),
              premiumRush: String(data.premiumRush),
            });
          }
        }
      } catch {
        setMessage({ type: "error", text: "Failed to load rate card." });
      } finally {
        setLoading(false);
      }
    }
    fetchRateCard();
  }, [router]);

  function update(field: keyof RateCardForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const body = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, parseFloat(v) || 0])
    );

    try {
      const res = await fetch("/api/drivers/me/rate-card", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      setMessage({ type: "success", text: "Rate card saved!" });
      setIsNew(false);
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save rate card.",
      });
    } finally {
      setSaving(false);
    }
  }

  // Quick preview: estimate what a 20-mile medium delivery would cost
  const previewPrice = (() => {
    const base = parseFloat(form.baseRate) || 0;
    const miles = 20 * (parseFloat(form.perMileRate) || 0);
    const size = parseFloat(form.surgMedium) || 0;
    return Math.max(base, base + miles + size);
  })();

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? "Set Up Your Pricing" : "Your Rate Card"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isNew
                ? "Set your rates below. This takes about 2 minutes. Shippers will see auto-generated quotes based on these rates."
                : "Update your pricing anytime. Changes apply to new jobs only."}
            </p>
          </div>
          <Link
            href="/dashboard/driver"
            className="text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            &larr; Dashboard
          </Link>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Live Preview */}
        <div className="mt-6 rounded-xl bg-orange-50 border border-orange-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">
                Preview: 20-mile medium delivery
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                Your auto-quote would be approximately:
              </p>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              ${previewPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Core Rates */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Base Pricing
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Your minimum charge and per-mile rate are the foundation of every quote.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Base Rate (minimum per job)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value={form.baseRate}
                    onChange={(e) => update("baseRate", e.target.value)}
                    className={inputClass + " pl-7"}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Per-Mile Rate</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value={form.perMileRate}
                    onChange={(e) => update("perMileRate", e.target.value)}
                    className={inputClass + " pl-7"}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Size Surcharges */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Size Surcharges
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Extra charge added based on package size. Set to $0 for no surcharge.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {([
                ["surgSmall", "Small", "Envelopes, small boxes"],
                ["surgMedium", "Medium", "Furniture, appliances"],
                ["surgLarge", "Large", "Couches, mattresses"],
                ["surgXL", "XL", "Multiple large items"],
                ["surgXXL", "XXL", "Full room moves"],
                ["surgPallet", "Pallet", "Freight / palletized"],
              ] as const).map(([key, label, desc]) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <p className="text-xs text-gray-400">{desc}</p>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className={inputClass + " pl-7"}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weight Surcharges */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Weight Surcharges
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Extra charge based on approximate weight of the shipment.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {([
                ["surgWeightLight", "Under 50 lbs"],
                ["surgWeightMedium", "50 – 150 lbs"],
                ["surgWeightHeavy", "150 – 500 lbs"],
                ["surgWeightExtraHeavy", "500+ lbs"],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className={inputClass + " pl-7"}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-unit & Speed */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Multi-Item & Speed Premiums
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Per Extra Item</label>
                <p className="text-xs text-gray-400">Each item beyond the first</p>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value={form.perExtraItem}
                    onChange={(e) => update("perExtraItem", e.target.value)}
                    className={inputClass + " pl-7"}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Same-Day Premium</label>
                <p className="text-xs text-gray-400">Added for same-day delivery</p>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value={form.premiumSameDay}
                    onChange={(e) => update("premiumSameDay", e.target.value)}
                    className={inputClass + " pl-7"}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Rush Premium</label>
                <p className="text-xs text-gray-400">Added for ASAP / rush delivery</p>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value={form.premiumRush}
                    onChange={(e) => update("premiumRush", e.target.value)}
                    className={inputClass + " pl-7"}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : isNew ? "Save Rate Card" : "Update Rate Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
