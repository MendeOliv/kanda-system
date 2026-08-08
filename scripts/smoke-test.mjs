#!/usr/bin/env node

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';
const INTERNAL_KEY = process.env.N8N_INTERNAL_KEY || 'your-n8n-internal-key-32-characters-minimum1234567890';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const body = await response.text();
  let json;

  try {
    json = JSON.parse(body);
  } catch {
    json = body;
  }

  return { status: response.status, json };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  console.log(`Running smoke tests against ${API_URL}`);

  const root = await request('/');
  assert(root.status === 200, `Root health failed: ${root.status}`);
  console.log('✓ GET /');

  const health = await request('/health');
  assert(health.status === 200, `Health check failed: ${health.status}`);
  console.log('✓ GET /health');

  const products = await request('/products');
  assert(products.status === 200, `Products list failed: ${products.status}`);
  console.log('✓ GET /products');

  const internalHealth = await request('/internal/health', {
      headers: { 'x-internal-key': INTERNAL_KEY },
    });
    assert(internalHealth.status === 200, `Internal health failed: ${internalHealth.status}`);
    console.log('✓ GET /internal/health');

    // Test automation health (new endpoint)
    const automationHealth = await request('/automation/health');
    assert(automationHealth.status === 200, `Automation health failed: ${automationHealth.status}`);
    console.log('✓ GET /automation/health');

    // Test parse shopping list
    const parseResult = await request('/automation/parse-shopping-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '2 arroz\n1 água' }),
    });
    assert(parseResult.status === 200, `Parse shopping list failed: ${parseResult.status}`);
    console.log('✓ POST /automation/parse-shopping-list');

    // Test fuzzy search
    const searchResult = await request('/products/search?q=arroz');
    assert(searchResult.status === 200, `Product search failed: ${searchResult.status}`);
    console.log('✓ GET /products/search?q=arroz');

  const deliveryFees = { KK5000: 700, KILAMBA: 500 };
  assert(deliveryFees.KK5000 === 700 && deliveryFees.KILAMBA === 500, 'Delivery fee constants mismatch');
  console.log('✓ Delivery fee constants (KK5000=700, KILAMBA=500)');

  console.log('\nAll smoke tests passed.');
}

main().catch((error) => {
  console.error('\nSmoke tests failed:', error.message);
  process.exit(1);
});
