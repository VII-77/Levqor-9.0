"use client";
import { useState } from "react";

const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
];

export default function LanguageSwitcher() {
  const [selected, setSelected] = useState("en");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <span className="text-lg">{LANGUAGES.find(l => l.code === selected)?.flag}</span>
        <span className="text-sm font-medium">{LANGUAGES.find(l => l.code === selected)?.code.toUpperCase()}</span>
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelected(lang.code);
                setOpen(false);
                // TODO: Implement actual language switching
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 ${
                selected === lang.code ? "bg-gray-50" : ""
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
