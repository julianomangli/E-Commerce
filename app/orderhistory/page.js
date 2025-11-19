"use client";
import { FiCheckCircle } from "react-icons/fi";
import { useMemo } from "react";

const currency = (n, c = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(n);

export default function OrderHistory({
  orders = demoOrders,
  currencyCode = "USD",
  onViewOrder = (order) => console.log("view order", order.id),
  onViewInvoice = (order) => console.log("view invoice", order.id),
  onBuyAgain = (item) => console.log("buy again", item.id),
}) {
  // total amount shown in header comes from order.total
  const fmt = useMemo(
    () => (n) => currency(n, currencyCode),
    [currencyCode]
  );

  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-black">Order history</h1>
        <p className="mt-1 text-sm text-gray-500">
          Check the status of recent orders, manage returns, and discover similar products.
        </p>

        <div className="mt-6 space-y-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white"
            >
              {/* Order header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-200 p-4 sm:p-6">
                <dl className="grid grid-cols-3 gap-6 w-full lg:w-auto">
                  <div>
                    <dt className="text-xs text-gray-500">Order number</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {order.number}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Date placed</dt>
                    <dd className="mt-1 text-sm font-medium text-gray-900">
                      {order.datePlaced}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Total amount</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {fmt(order.total)}
                    </dd>
                  </div>
                </dl>

                <div className="flex gap-3">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Order
                  </button>
                  <button
                    onClick={() => onViewInvoice(order)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Invoice
                  </button>
                </div>
              </div>

              {/* Line items */}
              <ul role="list" className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-[112px_1fr_auto] gap-4 sm:gap-6">
                      {/* image */}
                      <div className="h-28 w-28 rounded-lg bg-gray-100 overflow-hidden">
                        <img
                          src={item.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* info */}
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                              {item.description}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {fmt(item.price)}
                          </p>
                        </div>

                        {/* delivered */}
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                          <FiCheckCircle className="text-green-600" />
                          <span>
                            Delivered on {item.deliveredOn}
                          </span>
                        </div>
                      </div>

                      {/* actions */}
                      <div className="sm:text-right">
                        <div className="h-full flex sm:flex-col justify-end sm:items-end gap-3 text-sm">
                          <a
                            href={item.productUrl || "#"}
                            className="text-violet-600 hover:text-violet-500"
                          >
                            View product
                          </a>
                          <span className="hidden sm:block text-gray-300">|</span>
                          <button
                            onClick={() => onBuyAgain(item)}
                            className="text-violet-600 hover:text-violet-500"
                          >
                            Buy again
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Demo data (you can replace with real orders) ---------- */
const demoOrders = [
  {
    id: "ord-1",
    number: "WU88191111",
    datePlaced: "Jul 6, 2021",
    total: 160,
    items: [
      {
        id: "micro-backpack",
        name: "Micro Backpack",
        description:
          "Minimalist compact carry for essential everyday items. Wear as a backpack or satchel.",
        price: 70,
        deliveredOn: "July 12, 2021",
        image:
          "https://images.unsplash.com/photo-1500043357865-c6b8827edf5d?q=80&w=600&auto=format&fit=crop",
        productUrl: "#",
      },
      {
        id: "nomad-tote",
        name: "Nomad Shopping Tote",
        description:
          "Durable yellow canvas tote with multiple carry options for your next adventure.",
        price: 90,
        deliveredOn: "July 12, 2021",
        image:
          "https://images.unsplash.com/photo-1520975693411-95a88b283f1d?q=80&w=600&auto=format&fit=crop",
        productUrl: "#",
      },
    ],
  },
  {
    id: "ord-2",
    number: "AT48441546",
    datePlaced: "Dec 22, 2020",
    total: 40,
    items: [
      {
        id: "double-stack-bag",
        name: "Double Stack Clothing Bag",
        description:
          "Protect and organize clothes in a double-layer garment bag. Great for trips.",
        price: 40,
        deliveredOn: "January 5, 2021",
        image:
          "https://images.unsplash.com/photo-1520975856205-9f8d8e3d113f?q=80&w=600&auto=format&fit=crop",
        productUrl: "#",
      },
    ],
  },
];
