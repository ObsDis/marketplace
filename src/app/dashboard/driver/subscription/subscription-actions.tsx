"use client";

import { useState } from "react";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="inline-flex items-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
    >
      {loading ? "Redirecting to Stripe..." : "Subscribe for $99.99/mo"}
    </button>
  );
}

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Loading..." : "Manage Subscription"}
    </button>
  );
}

export function UpdatePaymentButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className="inline-flex items-center rounded-lg bg-yellow-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-yellow-500 disabled:opacity-50"
    >
      {loading ? "Loading..." : "Update Payment Method"}
    </button>
  );
}
