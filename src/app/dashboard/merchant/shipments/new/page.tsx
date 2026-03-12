"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewShipmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    pickupZip: "",
    dropAddress: "",
    dropCity: "",
    dropState: "",
    dropZip: "",
    weight: "",
    vehicleType: "VAN",
    price: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.title.trim()) {
      setError("Shipment title is required");
      setLoading(false);
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Price must be greater than zero");
      setLoading(false);
      return;
    }

    if (
      !form.pickupCity.trim() ||
      !form.pickupState.trim() ||
      !form.dropCity.trim() ||
      !form.dropState.trim()
    ) {
      setError("Pickup and drop-off city and state are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          pickupAddress: form.pickupAddress.trim(),
          pickupCity: form.pickupCity.trim(),
          pickupState: form.pickupState.trim(),
          pickupZip: form.pickupZip.trim(),
          dropAddress: form.dropAddress.trim(),
          dropCity: form.dropCity.trim(),
          dropState: form.dropState.trim(),
          dropZip: form.dropZip.trim(),
          weight: form.weight ? parseFloat(form.weight) : undefined,
          vehicleType: form.vehicleType,
          price: parseFloat(form.price),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create shipment");
      }

      router.push("/dashboard/merchant/shipments");
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
          <h1 className="text-2xl font-bold text-gray-900">Post New Shipment</h1>
          <p className="text-gray-500 mt-1">
            Create a new logistics shipment posting
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
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Shipment Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Furniture delivery to Dallas"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
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
                rows={3}
                placeholder="Describe the shipment contents, special handling requirements, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Pickup Address */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-sm font-semibold text-gray-900 px-2">
                Pickup Location
              </legend>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="pickupAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="pickupAddress"
                    name="pickupAddress"
                    value={form.pickupAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="pickupCity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      id="pickupCity"
                      name="pickupCity"
                      value={form.pickupCity}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pickupState"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State *
                    </label>
                    <input
                      type="text"
                      id="pickupState"
                      name="pickupState"
                      value={form.pickupState}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="pickupZip"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="pickupZip"
                      name="pickupZip"
                      value={form.pickupZip}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Drop-off Address */}
            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-sm font-semibold text-gray-900 px-2">
                Drop-off Location
              </legend>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="dropAddress"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="dropAddress"
                    name="dropAddress"
                    value={form.dropAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="dropCity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      id="dropCity"
                      name="dropCity"
                      value={form.dropCity}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dropState"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State *
                    </label>
                    <input
                      type="text"
                      id="dropState"
                      name="dropState"
                      value={form.dropState}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dropZip"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      id="dropZip"
                      name="dropZip"
                      value={form.dropZip}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="vehicleType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Vehicle Type *
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                >
                  <option value="VAN">Van</option>
                  <option value="BOX_TRUCK">Box Truck</option>
                  <option value="SEMI">Semi</option>
                  <option value="FLATBED">Flatbed</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/merchant/shipments"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post Shipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
