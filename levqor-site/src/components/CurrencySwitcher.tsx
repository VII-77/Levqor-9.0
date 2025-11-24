"use client";
import { useState } from "react";
import { CURRENCY_RATES } from "@/config/currency";

export type Currency = "GBP" | "USD" | "EUR";

interface Props {
  onCurrencyChange?: (currency: Currency) => void;
}

export default function CurrencySwitcher({ onCurrencyChange }: Props) {
  const [selected, setSelected] = useState<Currency>("GBP");

  const handleChange = (currency: Currency) => {
    setSelected(currency);
    onCurrencyChange?.(currency);
  };

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      {(["GBP", "USD", "EUR"] as Currency[]).map((curr) => (
        <button
          key={curr}
          onClick={() => handleChange(curr)}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            selected === curr
              ? "bg-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {curr}
        </button>
      ))}
    </div>
  );
}
