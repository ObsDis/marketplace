"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeliveryActionsProps {
  deliveryId: string;
  status: string;
  canAccept: boolean;
  canUpdateStatus: boolean;
  canCancel: boolean;
}

const nextStatusMap: Record<string, { label: string; status: string }> = {
  ACCEPTED: { label: "Mark as Picked Up", status: "PICKED_UP" },
  PICKED_UP: { label: "Mark as In Transit", status: "IN_TRANSIT" },
  IN_TRANSIT: { label: "Mark as Delivered", status: "DELIVERED" },
};

export default function DeliveryActions({
  deliveryId,
  status,
  canAccept,
  canUpdateStatus,
  canCancel,
}: DeliveryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(newStatus: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const nextAction = nextStatusMap[status];

  return (
    <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Actions
      </h3>
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        {canAccept && (
          <button
            onClick={() => updateStatus("ACCEPTED")}
            disabled={loading}
            className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? "Accepting..." : "Accept Delivery"}
          </button>
        )}
        {canUpdateStatus && nextAction && (
          <button
            onClick={() => updateStatus(nextAction.status)}
            disabled={loading}
            className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? "Updating..." : nextAction.label}
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => updateStatus("CANCELLED")}
            disabled={loading}
            className="rounded-lg border border-red-300 bg-white px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {loading ? "Cancelling..." : "Cancel Delivery"}
          </button>
        )}
      </div>
    </div>
  );
}
