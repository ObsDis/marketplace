"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface QuoteDriver {
  id: string;
  displayName: string;
  rating: number;
  totalDeliveries: number;
  photo: string | null;
  vanInfo: string | null;
}

interface Quote {
  id: string;
  deliveryId: string;
  driverId: string;
  amount: number;
  autoQuotedAmount: number;
  message: string | null;
  estimatedPickup: string | null;
  status: string;
  counterAmount: number | null;
  counterStatus: string | null;
  negotiationRound: number;
  createdAt: string;
  driver: QuoteDriver;
}

interface QuotePanelProps {
  deliveryId: string;
  isShipper: boolean;
  isDriver: boolean;
  driverAutoQuote: number | null; // pre-calculated from rate card
  deliveryStatus: string;
}

export default function QuotePanel({
  deliveryId,
  isShipper,
  isDriver,
  driverAutoQuote,
  deliveryStatus,
}: QuotePanelProps) {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Driver quote form
  const [quoteAmount, setQuoteAmount] = useState(
    driverAutoQuote?.toFixed(2) || ""
  );
  const [quoteMessage, setQuoteMessage] = useState("");
  const [estimatedPickup, setEstimatedPickup] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Shipper counter-offer
  const [counteringQuoteId, setCounteringQuoteId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");

  useEffect(() => {
    fetchQuotes();
  }, [deliveryId]);

  async function fetchQuotes() {
    try {
      const res = await fetch(`/api/quotes?deliveryId=${deliveryId}`);
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
        // Check if driver already submitted
        if (isDriver && data.length > 0) {
          setHasSubmitted(true);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryId,
          amount: parseFloat(quoteAmount),
          message: quoteMessage || undefined,
          estimatedPickup: estimatedPickup || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit quote");
      }

      setHasSubmitted(true);
      fetchQuotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuoteAction(
    quoteId: string,
    action: string,
    extra?: Record<string, unknown>
  ) {
    setActionLoading(quoteId);
    setError("");

    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      if (action === "accept" && data.checkoutUrl) {
        // Redirect to Stripe Checkout for payment
        window.location.href = data.checkoutUrl;
        return;
      } else if (action === "accept") {
        router.refresh();
      } else {
        fetchQuotes();
      }
      setCounteringQuoteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">Loading quotes...</p>
      </div>
    );
  }

  const isOpen = deliveryStatus === "POSTED";

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ─── Driver: Submit Quote ─────────────────────────── */}
      {isDriver && isOpen && !hasSubmitted && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Submit Your Quote
          </h3>
          {driverAutoQuote && (
            <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
              <p className="text-sm text-blue-800">
                Your rate card suggests:{" "}
                <span className="font-bold">${driverAutoQuote.toFixed(2)}</span>
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                You can adjust this amount before submitting.
              </p>
            </div>
          )}
          <form onSubmit={submitQuote} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Price ($)
                </label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estimated Pickup
                </label>
                <input
                  type="text"
                  value={estimatedPickup}
                  onChange={(e) => setEstimatedPickup(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="e.g. Within 2 hours"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Message (optional)
              </label>
              <textarea
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Anything the shipper should know..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-orange-500 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Quote"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Driver: Already submitted ─���─────────────────── */}
      {isDriver && hasSubmitted && quotes.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Your Quote
          </h3>
          {quotes.map((q) => (
            <div key={q.id} className="mt-3">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-900">
                  ${q.amount.toFixed(2)}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    q.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700"
                      : q.status === "DECLINED"
                      ? "bg-red-100 text-red-700"
                      : q.status === "COUNTERED"
                      ? "bg-amber-100 text-amber-700"
                      : q.status === "WITHDRAWN"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {q.status === "COUNTERED" ? "Counter-Offer Received" : q.status}
                </span>
              </div>

              {/* Counter-offer received by driver */}
              {q.status === "COUNTERED" &&
                q.counterStatus === "PENDING" &&
                q.counterAmount && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm text-amber-800">
                      The shipper countered at{" "}
                      <span className="font-bold">
                        ${q.counterAmount.toFixed(2)}
                      </span>
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() =>
                          handleQuoteAction(q.id, "accept_counter")
                        }
                        disabled={actionLoading === q.id}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        Accept ${q.counterAmount.toFixed(2)}
                      </button>
                      <button
                        onClick={() =>
                          handleQuoteAction(q.id, "decline_counter")
                        }
                        disabled={actionLoading === q.id}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        Hold Firm at ${q.amount.toFixed(2)}
                      </button>
                    </div>
                  </div>
                )}

              {q.counterStatus === "DECLINED" && (
                <p className="mt-2 text-xs text-gray-500">
                  You held firm at your original price. Waiting for shipper to
                  decide.
                </p>
              )}

              {q.counterStatus === "ACCEPTED" && q.status === "PENDING" && (
                <p className="mt-2 text-xs text-green-600">
                  You accepted the counter-offer. Waiting for shipper to
                  confirm.
                </p>
              )}

              {/* Withdraw */}
              {isOpen &&
                q.status !== "WITHDRAWN" &&
                q.status !== "ACCEPTED" &&
                q.status !== "DECLINED" && (
                  <button
                    onClick={() => handleQuoteAction(q.id, "withdraw")}
                    disabled={actionLoading === q.id}
                    className="mt-3 text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Withdraw Quote
                  </button>
                )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Shipper: View Quotes ────────────────────────── */}
      {isShipper && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Driver Quotes ({quotes.filter((q) => q.status !== "WITHDRAWN" && q.status !== "DECLINED").length})
          </h3>

          {quotes.length === 0 ? (
            <div className="mt-4 text-center py-6">
              <p className="text-sm text-gray-500">
                No quotes yet. Drivers will be notified of your delivery.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                If no quotes arrive within 15-20 minutes, consider expanding
                your pickup window or checking your delivery details.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {quotes
                .filter((q) => q.status !== "WITHDRAWN")
                .map((q) => (
                  <div
                    key={q.id}
                    className={`rounded-lg border p-4 ${
                      q.status === "ACCEPTED"
                        ? "border-green-300 bg-green-50"
                        : q.status === "DECLINED"
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-gray-200"
                    }`}
                  >
                    {/* Driver info + price */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {q.driver.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {q.driver.displayName}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {q.driver.rating > 0 && (
                              <span>
                                {q.driver.rating.toFixed(1)} stars
                              </span>
                            )}
                            <span>
                              {q.driver.totalDeliveries} deliveries
                            </span>
                            {q.driver.vanInfo && (
                              <span>{q.driver.vanInfo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${q.amount.toFixed(2)}
                        </p>
                        {q.estimatedPickup && (
                          <p className="text-xs text-gray-500">
                            {q.estimatedPickup}
                          </p>
                        )}
                      </div>
                    </div>

                    {q.message && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        &ldquo;{q.message}&rdquo;
                      </p>
                    )}

                    {/* Counter-offer status */}
                    {q.counterAmount && q.counterStatus && (
                      <div className="mt-2 text-xs text-gray-500">
                        {q.counterStatus === "PENDING" && (
                          <span className="text-amber-600">
                            You countered at ${q.counterAmount.toFixed(2)} —
                            waiting for driver response
                          </span>
                        )}
                        {q.counterStatus === "ACCEPTED" && (
                          <span className="text-green-600">
                            Driver accepted your counter of $
                            {q.counterAmount.toFixed(2)}
                          </span>
                        )}
                        {q.counterStatus === "DECLINED" && (
                          <span className="text-red-600">
                            Driver held firm at ${q.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Shipper actions */}
                    {isOpen &&
                      q.status !== "DECLINED" &&
                      q.status !== "ACCEPTED" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {/* Accept button — show if pending or counter was resolved */}
                          {(q.status === "PENDING" ||
                            (q.status === "COUNTERED" &&
                              q.counterStatus !== "PENDING")) && (
                            <button
                              onClick={() =>
                                handleQuoteAction(q.id, "accept")
                              }
                              disabled={actionLoading === q.id}
                              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                            >
                              Accept ${q.amount.toFixed(2)}
                            </button>
                          )}

                          {/* Counter button — only if not already countered max times */}
                          {q.status === "PENDING" &&
                            q.negotiationRound < 2 && (
                              <>
                                {counteringQuoteId === q.id ? (
                                  <div className="flex items-center gap-2">
                                    <div className="relative">
                                      <span className="absolute left-3 top-2 text-sm text-gray-400">
                                        $
                                      </span>
                                      <input
                                        type="number"
                                        value={counterAmount}
                                        onChange={(e) =>
                                          setCounterAmount(e.target.value)
                                        }
                                        className="w-28 rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm"
                                        placeholder="Amount"
                                        min="1"
                                        step="0.01"
                                      />
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleQuoteAction(q.id, "counter", {
                                          counterAmount:
                                            parseFloat(counterAmount),
                                        })
                                      }
                                      disabled={
                                        actionLoading === q.id ||
                                        !counterAmount
                                      }
                                      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400 disabled:opacity-50"
                                    >
                                      Send
                                    </button>
                                    <button
                                      onClick={() =>
                                        setCounteringQuoteId(null)
                                      }
                                      className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setCounteringQuoteId(q.id);
                                      setCounterAmount("");
                                    }}
                                    className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                                  >
                                    Counter-Offer
                                  </button>
                                )}
                              </>
                            )}

                          {/* Decline */}
                          {q.status === "PENDING" && (
                            <button
                              onClick={() =>
                                handleQuoteAction(q.id, "decline")
                              }
                              disabled={actionLoading === q.id}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          )}
                        </div>
                      )}

                    {q.status === "ACCEPTED" && (
                      <p className="mt-2 text-sm font-medium text-green-700">
                        Quote accepted! Price: ${q.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
