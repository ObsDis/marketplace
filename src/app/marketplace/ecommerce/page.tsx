import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export default async function EcommercePage() {
  const products = await db.product.findMany({
    where: { active: true },
    include: { merchant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/marketplace"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Marketplace
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">E-Commerce</h1>
              <p className="mt-1 text-gray-600">
                Browse products from verified merchants
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No products listed yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back soon for new listings from our merchants.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Image */}
                {product.images.length > 0 ? (
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-gray-100">
                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                  </div>
                )}

                {/* Details */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.merchant.businessName}
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/marketplace/ecommerce/${product.id}`}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
