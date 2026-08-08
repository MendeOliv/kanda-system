export type DeliveryZone = 'KK5000' | 'KILAMBA';

/** Mirrors backend OrdersService delivery fee logic */
export const DELIVERY_FEES: Record<DeliveryZone, number> = {
  KK5000: 700,
  KILAMBA: 500,
};

export function getDeliveryFee(zone: DeliveryZone = 'KK5000'): number {
  return DELIVERY_FEES[zone];
}
