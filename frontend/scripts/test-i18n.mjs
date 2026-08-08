#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '../src/messages');

function collectKeys(value, prefix = '') {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nested]) =>
    collectKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

function main() {
  const pt = JSON.parse(fs.readFileSync(path.join(messagesDir, 'pt-AO.json'), 'utf8'));
  const en = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));

  const ptKeys = new Set(collectKeys(pt));
  const enKeys = new Set(collectKeys(en));

  const missingInEn = [...ptKeys].filter((key) => !enKeys.has(key));
  const missingInPt = [...enKeys].filter((key) => !ptKeys.has(key));

  if (missingInEn.length || missingInPt.length) {
    console.error('i18n key mismatch');
    if (missingInEn.length) console.error('Missing in en.json:', missingInEn.slice(0, 10));
    if (missingInPt.length) console.error('Missing in pt-AO.json:', missingInPt.slice(0, 10));
    process.exit(1);
  }

  const required = ['header.home', 'language.label', 'delivery.feeLabel', 'cart.title'];
  for (const key of required) {
    if (!ptKeys.has(key) || !enKeys.has(key)) {
      throw new Error(`Missing required i18n key: ${key}`);
    }
  }

  console.log(`✓ i18n messages aligned (${ptKeys.size} keys)`);
}

main();
