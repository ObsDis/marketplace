"use client";

type PackageSizeOption = {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const sizes: PackageSizeOption[] = [
  {
    value: "SMALL",
    label: "Small",
    description: "Fits in a shoe box",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="16" y="24" width="32" height="20" rx="2" />
        <path d="M16 30h32" />
        <path d="M28 24v-4h8v4" />
        <path d="M30 30v14M34 30v14" />
      </svg>
    ),
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Fits in the front seat",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="36" width="48" height="4" rx="1" />
        <path d="M12 36V20a2 2 0 012-2h12l4 6h22a2 2 0 012 2v10" />
        <circle cx="18" cy="42" r="4" />
        <circle cx="46" cy="42" r="4" />
        <rect x="22" y="22" width="12" height="10" rx="1" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    value: "LARGE",
    label: "Large",
    description: "Fills up the back seat",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="34" width="52" height="6" rx="2" />
        <path d="M10 34V18a2 2 0 012-2h14l4 6h24a2 2 0 012 2v10" />
        <circle cx="16" cy="42" r="4" />
        <circle cx="48" cy="42" r="4" />
        <rect x="20" y="20" width="8" height="10" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="30" y="20" width="8" height="10" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="40" y="20" width="8" height="10" rx="1" fill="currentColor" opacity="0.15" />
      </svg>
    ),
  },
  {
    value: "XL",
    label: "XL",
    description: "Fits in a SUV (e.g. a bike)",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="20" cy="42" r="8" />
        <circle cx="44" cy="42" r="8" />
        <path d="M28 42l4-16h8l6 10" />
        <path d="M28 42h18" />
        <path d="M32 26l-4 16" />
        <path d="M36 26v-4" />
        <path d="M33 22h6" />
      </svg>
    ),
  },
  {
    value: "XXL",
    label: "XXL",
    description: "Cargo Van required (e.g. upright piano)",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="16" y="12" width="32" height="40" rx="2" />
        <rect x="20" y="16" width="24" height="28" rx="1" />
        <line x1="24" y1="44" x2="24" y2="48" />
        <line x1="28" y1="44" x2="28" y2="48" />
        <line x1="32" y1="44" x2="32" y2="48" />
        <line x1="36" y1="44" x2="36" y2="48" />
        <line x1="40" y1="44" x2="40" y2="48" />
        <rect x="14" y="52" width="6" height="4" rx="1" />
        <rect x="44" y="52" width="6" height="4" rx="1" />
      </svg>
    ),
  },
  {
    value: "PALLET",
    label: "Pallets",
    description: "Cargo Van / Box Truck / 53' Trailer",
    icon: (
      <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="12" y="40" width="40" height="6" rx="1" />
        <line x1="20" y1="46" x2="20" y2="52" />
        <line x1="32" y1="46" x2="32" y2="52" />
        <line x1="44" y1="46" x2="44" y2="52" />
        <rect x="16" y="20" width="14" height="20" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="32" y="26" width="14" height="14" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="22" y="10" width="12" height="10" rx="1" fill="currentColor" opacity="0.1" />
        <rect x="16" y="20" width="14" height="20" rx="1" />
        <rect x="32" y="26" width="14" height="14" rx="1" />
        <rect x="22" y="10" width="12" height="10" rx="1" />
      </svg>
    ),
  },
];

export default function PackageSizeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {sizes.map((size) => {
        const selected = value === size.value;
        return (
          <button
            key={size.value}
            type="button"
            onClick={() => onChange(size.value)}
            className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
              selected
                ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md ring-1 ring-orange-500/30"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {selected && (
              <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <div className={selected ? "text-orange-600" : "text-gray-400"}>
              {size.icon}
            </div>
            <span className="text-sm font-semibold">{size.label}</span>
            <span className="text-xs text-center leading-tight opacity-75">
              {size.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
