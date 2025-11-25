"use client";
import { useState } from "react";
import ConciergePanel from "./ConciergePanel";

export default function ConciergeButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center z-40 group"
        aria-label="Open AI Assistant"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
      </button>

      {isOpen && <ConciergePanel onClose={() => setIsOpen(false)} />}
    </>
  );
}
