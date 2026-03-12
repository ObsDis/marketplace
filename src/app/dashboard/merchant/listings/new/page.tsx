"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBrokerageListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    description: "",
    askingPrice: "",
    annualRevenue: "",
    annualProfit: "",
    employeeCount: "",
    yearEstablished: "",
    location: "",
    ndaRequired: false,
    images: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.businessName.trim()) {
      setError("Business name is required");
      setLoading(false);
      return;
    }

    if (!form.askingPrice || parseFloat(form.askingPrice) <= 0) {
      setError("Asking price must be greater than zero");
      setLoading(false);
      return;
    }

    if (!form.industry.trim()) {
      setError("Industry is required");
      setLoading(false);
      return;
    }

    try {
      const images = form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/brokerages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          industry: form.industry.trim(),
          description: form.description.trim(),
          askingPrice: parseFloat(form.askingPrice),
          annualRevenue: form.annualRevenue
            ? parseFloat(form.annualRevenue)
            : undefined,
          annualProfit: form.annualProfit
            ? parseFloat(form.annualProfit)
            : undefined,
          employeeCount: form.employeeCount
            ? parseInt(form.employeeCount, 10)
            : undefined,
          yearEstablished: form.yearEstablished
            ? parseInt(form.yearEstablished, 10)
            : undefined,
          location: form.location.trim() || undefined,
          ndaRequired: form.ndaRequired,
          images,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create listing");
      }

      router.push("/dashboard/merchant/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Brokerage Listing
          </h1>
          <p className="text-gray-500 mt-1">
            List a business for sale on the marketplace
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg text-sm font-medium bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Name *
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="industry"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Industry *
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Restaurant, SaaS, Retail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the business, its history, key strengths, and growth potential..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="askingPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Asking Price ($) *
                </label>
                <input
                  type="number"
                  id="askingPrice"
                  name="askingPrice"
                  value={form.askingPrice}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="annualRevenue"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Annual Revenue ($)
                </label>
                <input
                  type="number"
                  id="annualRevenue"
                  name="annualRevenue"
                  value={form.annualRevenue}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="annualProfit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Annual Profit ($)
                </label>
                <input
                  type="number"
                  id="annualProfit"
                  name="annualProfit"
                  value={form.annualProfit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="employeeCount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Employee Count
                </label>
                <input
                  type="number"
                  id="employeeCount"
                  name="employeeCount"
                  value={form.employeeCount}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="yearEstablished"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Year Established
                </label>
                <input
                  type="number"
                  id="yearEstablished"
                  name="yearEstablished"
                  value={form.yearEstablished}
                  onChange={handleChange}
                  min="1800"
                  max={new Date().getFullYear()}
                  step="1"
                  placeholder="e.g. 2015"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Austin, TX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="ndaRequired"
                  checked={form.ndaRequired}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Require NDA before sharing details
                </span>
              </label>
            </div>

            <div>
              <label
                htmlFor="images"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image URLs
              </label>
              <input
                type="text"
                id="images"
                name="images"
                value={form.images}
                onChange={handleChange}
                placeholder="Comma-separated URLs, e.g. https://img1.jpg, https://img2.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter image URLs separated by commas
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/merchant/listings"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
