import { PackageSize, DeliverySpeed } from "@/generated/prisma";

export interface RateCardData {
  baseRate: number;
  perMileRate: number;
  surgSmall: number;
  surgMedium: number;
  surgLarge: number;
  surgXL: number;
  surgXXL: number;
  surgPallet: number;
  surgWeightLight: number;
  surgWeightMedium: number;
  surgWeightHeavy: number;
  surgWeightExtraHeavy: number;
  perExtraItem: number;
  premiumSameDay: number;
  premiumRush: number;
}

export interface DeliveryParams {
  distance: number | null;
  packageSize: PackageSize;
  packageWeight: number | null;
  packageCount: number;
  deliverySpeed: DeliverySpeed;
}

const SIZE_SURCHARGE_MAP: Record<PackageSize, keyof RateCardData> = {
  SMALL: "surgSmall",
  MEDIUM: "surgMedium",
  LARGE: "surgLarge",
  XL: "surgXL",
  XXL: "surgXXL",
  PALLET: "surgPallet",
};

function getWeightSurcharge(rateCard: RateCardData, weight: number | null): number {
  if (!weight || weight <= 0) return 0;
  if (weight < 50) return rateCard.surgWeightLight;
  if (weight < 150) return rateCard.surgWeightMedium;
  if (weight < 500) return rateCard.surgWeightHeavy;
  return rateCard.surgWeightExtraHeavy;
}

function getSpeedPremium(rateCard: RateCardData, speed: DeliverySpeed): number {
  switch (speed) {
    case "SAME_DAY":
      return rateCard.premiumSameDay;
    case "RUSH":
      return rateCard.premiumRush;
    default:
      return 0;
  }
}

/**
 * Calculate an auto-quote for a delivery based on a driver's rate card.
 * Returns the dollar amount rounded to 2 decimals.
 */
export function calculateQuote(
  rateCard: RateCardData,
  delivery: DeliveryParams
): number {
  const distance = delivery.distance ?? 0;

  // Base + per-mile
  let total = rateCard.baseRate + distance * rateCard.perMileRate;

  // Size surcharge
  const sizeKey = SIZE_SURCHARGE_MAP[delivery.packageSize];
  total += rateCard[sizeKey] as number;

  // Weight surcharge
  total += getWeightSurcharge(rateCard, delivery.packageWeight);

  // Multi-unit pricing
  if (delivery.packageCount > 1) {
    total += (delivery.packageCount - 1) * rateCard.perExtraItem;
  }

  // Speed premium
  total += getSpeedPremium(rateCard, delivery.deliverySpeed);

  // Never go below the base rate
  total = Math.max(total, rateCard.baseRate);

  return Math.round(total * 100) / 100;
}
