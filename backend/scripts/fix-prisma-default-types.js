#!/usr/bin/env node
/**
 * Fix @prisma/client/default.d.ts after `prisma generate` overwrites it.
 *
 * Prisma 6.19.x generator writes:
 *   export * from "../.prisma/client/index"
 *   export type { PrismaClient } from "../.prisma/client/index"
 *
 * The second line narrows PrismaClient to a type-only export, which
 * overrides the value export from `export *`. This makes PrismaClient
 * unusable as a value (cannot `extend` or `new` it), breaking the build
 * with TS2307 / TS1362 errors across the entire backend.
 *
 * The npm package ships the correct single-line default.d.ts:
 *   export * from '.prisma/client/default'
 *
 * This script restores that content after every `prisma generate` run.
 */

const fs = require('fs');
const path = require('path');

const defaultDts = path.join(
  __dirname,
  '..',
  'node_modules',
  '@prisma',
  'client',
  'default.d.ts',
);

const FIX = "export * from '.prisma/client/default'\n";

try {
  const current = fs.readFileSync(defaultDts, 'utf8');
  if (current === FIX) {
    // Already correct — nothing to do.
    process.exit(0);
  }

  // Overwrite the broken content shipped by the Prisma generator.
  fs.writeFileSync(defaultDts, FIX, 'utf8');
  console.log(
    'fix-prisma-default-types: repaired @prisma/client/default.d.ts',
  );
} catch (err) {
  // If the file doesn't exist or can't be read, skip silently —
  // this is a best-effort fix that shouldn't break CI.
  if (err.code !== 'ENOENT') {
    console.warn('fix-prisma-default-types: could not repair default.d.ts —', err.message);
  }
}
