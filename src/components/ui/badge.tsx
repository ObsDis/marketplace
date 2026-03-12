import { type HTMLAttributes } from "react";

const colorStyles = {
  default: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-800",
  purple: "bg-purple-100 text-purple-700",
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: keyof typeof colorStyles;
}

export function Badge({
  color = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorStyles[color]} ${className}`}
      {...props}
    />
  );
}
