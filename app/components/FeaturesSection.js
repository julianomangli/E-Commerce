"use client";
import { FaShippingFast, FaHeadset, FaShoppingCart } from "react-icons/fa";

export default function FeaturesSection() {
  const features = [
    {
      id: 1,
      icon: <FaShippingFast className="black text-4xl" />,
      title: "Free Shipping",
      description:
        "It's not actually free, we just price it into the products. Someone's paying for it, and it's not us.",
    },
    {
      id: 2,
      icon: <FaHeadset className="black text-4xl" />,
      title: "24/7 Customer Support",
      description:
        "Our AI chat widget is powered by a naive series of if/else statements. Guaranteed to irritate.",
    },
    {
      id: 3,
      icon: <FaShoppingCart className="black text-4xl" />,
      title: "Fast Shopping Cart",
      description:
        "Look how fast that cart is going. What does this mean for the actual experience? I don't know.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {features.map((f) => (
            <div key={f.id} className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full blur-lg bg-violet-100" />
                <div className="relative z-10">{f.icon}</div>
              </div>
              <h3 className="text-black font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm max-w-xs">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
