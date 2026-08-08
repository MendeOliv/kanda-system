#!/usr/bin/env node

import { getDeliveryFee, DELIVERY_FEES } from '../src/lib/delivery.ts';

if (getDeliveryFee('KK5000') !== 700) {
  throw new Error('KK5000 fee should be 700');
}

if (getDeliveryFee('KILAMBA') !== 500) {
  throw new Error('KILAMBA fee should be 500');
}

if (DELIVERY_FEES.KK5000 + DELIVERY_FEES.KILAMBA !== 1200) {
  throw new Error('Unexpected delivery fee sum');
}

console.log('✓ Delivery fee calculation matches backend rules');
