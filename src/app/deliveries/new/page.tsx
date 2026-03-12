"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PackageSizeSelector from "@/components/delivery/PackageSizeSelector";

// Price estimation based on size, weight, and item count
function estimatePrice(
  size: string,
  weight: number,
  count: number
): number {
  const basePrices: Record<string, number> = {
    SMALL: 25,
    MEDIUM: 50,
    LARGE: 85,
    XL: 130,
    XXL: 200,
    PALLET: 350,
  };

  const base = basePrices[size] || 50;

  // Weight surcharge: $0.50 per lb over 20 lbs
  const weightSurcharge = weight > 20 ? (weight - 20) * 0.5 : 0;

  // Multi-item surcharge: each additional item adds 30% of base
  const countSurcharge = count > 1 ? (count - 1) * base * 0.3 : 0;

  return Math.round((base + weightSurcharge + countSurcharge) * 100) / 100;
}

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
    pickupDate: "",
    pickupTime: "",
    deliveryDate: "",
    deliveryTime: "",
    latestDeliveryTime: "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Compute estimated price
  const estimated = estimatePrice(
    form.packageSize,
    parseFloat(form.packageWeight) || 0,
    parseInt(form.packageCount) || 1
  );

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

  const updateForm = useCallback((field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    setError("");
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Generate previews
    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
    });
    setImagePreviews(newPreviews);
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function applyEstimate() {
    updateForm("price", estimated.toFixed(2));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Upload images first if any
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to upload images");
        }

        const uploadData = await uploadRes.json();
        imageUrls = uploadData.urls;
        setUploadingImages(false);
      }

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
        images: imageUrls.length > 0 ? imageUrls : undefined,
        price: parseFloat(form.price),
        pickupDate: form.pickupDate
          ? new Date(form.pickupDate).toISOString()
          : undefined,
        pickupTime: form.pickupTime || undefined,
        deliveryDate: form.deliveryDate
          ? new Date(form.deliveryDate).toISOString()
          : undefined,
        deliveryTime: form.deliveryTime || undefined,
        latestDeliveryTime: form.latestDeliveryTime || undefined,
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
      setUploadingImages(false);
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

          {/* Package Size Selector */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Package Size
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Select the size that best describes your shipment
            </p>
            <div className="mt-4">
              <PackageSizeSelector
                value={form.packageSize}
                onChange={(val) => updateForm("packageSize", val)}
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
                <label className={labelClass}>Number of Items</label>
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

          {/* Item Images */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Item Photos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Optional — upload up to 5 photos of items being shipped
            </p>
            <div className="mt-4">
              {imagePreviews.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="group relative">
                      <img
                        src={src}
                        alt={`Item ${i + 1}`}
                        className="h-24 w-24 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imageFiles.length < 5 && (
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition hover:border-orange-400 hover:text-orange-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                  <span>
                    Click to upload photos ({imageFiles.length}/5)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
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

          {/* Schedule */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Pickup Date</label>
                <input
                  type="date"
                  value={form.pickupDate}
                  onChange={(e) => updateForm("pickupDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Pickup Time</label>
                <input
                  type="time"
                  value={form.pickupTime}
                  onChange={(e) => updateForm("pickupTime", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Delivery Date</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => updateForm("deliveryDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Delivery Time</label>
                <input
                  type="time"
                  value={form.deliveryTime}
                  onChange={(e) => updateForm("deliveryTime", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Latest Delivery Time</label>
                <p className="text-xs text-gray-400 mt-0.5 mb-1">
                  The absolute latest time the delivery must arrive
                </p>
                <input
                  type="time"
                  value={form.latestDeliveryTime}
                  onChange={(e) =>
                    updateForm("latestDeliveryTime", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Budget</h2>

            {/* Price Estimate */}
            <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Estimated Price
                  </p>
                  <p className="text-xs text-orange-600 mt-0.5">
                    Based on size
                    {form.packageWeight ? ", weight" : ""}
                    {parseInt(form.packageCount) > 1 ? ", and item count" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-700">
                    ${estimated.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={applyEstimate}
                    className="mt-1 text-xs font-medium text-orange-600 hover:text-orange-800 underline transition"
                  >
                    Use this price
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4">
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
              {form.price && parseFloat(form.price) < estimated * 0.6 && (
                <p className="mt-1.5 text-xs text-amber-600">
                  This is significantly below the estimated price. Drivers may
                  be less likely to accept this delivery.
                </p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-600 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
            >
              {uploadingImages
                ? "Uploading images..."
                : submitting
                  ? "Posting..."
                  : "Post Delivery"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
