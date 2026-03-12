"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    digital: false,
    downloadUrl: "",
    inventory: "",
    images: "",
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (res.status === 401) {
          router.push("/auth/signin");
          return;
        }
        if (res.status === 404) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch product");

        const data = await res.json();
        setForm({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          category: data.category || "",
          digital: data.digital || false,
          downloadUrl: data.downloadUrl || "",
          inventory: data.inventory?.toString() || "0",
          images: Array.isArray(data.images) ? data.images.join(", ") : "",
        });
      } catch {
        setError("Failed to load product data");
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    setSaving(true);
    setError(null);

    if (!form.name.trim()) {
      setError("Product name is required");
      setSaving(false);
      return;
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      setError("Price must be greater than zero");
      setSaving(false);
      return;
    }

    if (form.digital && !form.downloadUrl.trim()) {
      setError("Download URL is required for digital products");
      setSaving(false);
      return;
    }

    try {
      const images = form.images
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          category: form.category.trim() || undefined,
          digital: form.digital,
          downloadUrl: form.digital ? form.downloadUrl.trim() : undefined,
          inventory: form.inventory ? parseInt(form.inventory, 10) : 0,
          images,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update product");
      }

      router.push("/dashboard/merchant/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete product");
      }

      router.push("/dashboard/merchant/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading product...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 mt-1">
            Update your product details
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
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
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
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics, Clothing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="inventory"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Inventory
                </label>
                <input
                  type="number"
                  id="inventory"
                  name="inventory"
                  value={form.inventory}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="digital"
                    checked={form.digital}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Digital Product
                  </span>
                </label>
              </div>
            </div>

            {form.digital && (
              <div>
                <label
                  htmlFor="downloadUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Download URL *
                </label>
                <input
                  type="url"
                  id="downloadUrl"
                  name="downloadUrl"
                  value={form.downloadUrl}
                  onChange={handleChange}
                  required={form.digital}
                  placeholder="https://example.com/file.zip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            )}

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

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </button>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/merchant/products"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || deleting}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
