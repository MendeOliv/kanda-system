const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const base = process.cwd(); // current directory (workspace root)
const frontend = path.join(base, 'frontend');
const files = {
  vercelJson: path.join(frontend, 'vercel.json'),
  vercelTrigger: path.join(frontend, '.vercel-trigger'),
  rootPage: path.join(frontend, 'src/app/page.tsx'),
  homePage: path.join(frontend, 'src/app/[locale]/(home)/page.tsx'),
  mercadoPage: path.join(frontend, 'src/app/[locale]/mercado/page.tsx')
};

let passed = 0;
const total = 5;

// 1. vercel.json
try {
  if (!fs.existsSync(files.vercelJson)) throw new Error('vercel.json missing');
  const content = fs.readFileSync(files.vercelJson, 'utf8');
  const data = JSON.parse(content);
  if (data.version === 2 && Array.isArray(data.builds) && data.builds.length === 1 && data.builds[0].src === 'package.json' && data.builds[0].use === '@vercel/next') {
    console.log('��✅ vercel.json valid');
    passed++;
  } else {
    console.log('��❌ vercel.json invalid structure:', data);
  }
} catch (e) {
  console.log('��❌ vercel.json error:', e.message);
}

// 2. .vercel-trigger
try {
  if (!fs.existsSync(files.vercelTrigger)) throw new Error('.vercel-trigger missing');
  const content = fs.readFileSync(files.vercelTrigger, 'utf8').trim();
  const ts = parseInt(content, 10);
  if (isNaN(ts)) throw new Error('not a number');
  const now = Math.floor(Date.now() / 1000);
  const diffMin = Math.floor((now - ts) / 60);
  if (diffMin >= 0 && diffMin < 1440) {
    console.log('��✅ .vercel-trigger recent timestamp');
    passed++;
  } else {
    console.log('��⚠��️ .vercel-trigger old or future:', ts);
  }
} catch (e) {
  console.log('��❌ .vercel-trigger error:', e.message);
}

// 3. rootPage redirect
try {
  if (!fs.existsSync(files.rootPage)) throw new Error('root page missing');
  const content = fs.readFileSync(files.rootPage, 'utf8');
  if (content.includes('redirect') && content.includes('/pt-AO')) {
    console.log('��✅ root page redirects to /pt-AO');
    passed++;
  } else {
    console.log('��❌ root page does not redirect correctly');
  }
} catch (e) {
  console.log('��❌ root page error:', e.message);
}

// 4. homePage uses Link and useParams
try {
  if (!fs.existsSync(files.homePage)) throw new Error('home page missing');
  const content = fs.readFileSync(files.homePage, 'utf8');
  const hasLink = content.includes('import Link from') && content.includes('next/link');
  const hasUseParams = content.includes('useParams') && content.includes('next/navigation');
  if (hasLink && hasUseParams) {
    console.log('��✅ home page uses Link and useParams');
    passed++;
  } else {
    console.log('��❌ home page missing Link or useParams');
    console.log('   hasLink:', hasLink, 'hasUseParams:', hasUseParams);
  }
} catch (e) {
  console.log('��❌ home page error:', e.message);
}

// 5. mercadoPage uses Link and useParams
try {
  if (!fs.existsSync(files.mercadoPage)) throw new Error('mercado page missing');
  const content = fs.readFileSync(files.mercadoPage, 'utf8');
  const hasLink = content.includes('import Link from') && content.includes('next/link');
  const hasUseParams = content.includes('useParams') && content.includes('next/navigation');
  if (hasLink && hasUseParams) {
    console.log('��✅ mercado page uses Link and useParams');
    passed++;
  } else {
    console.log('��❌ mercado page missing Link or useParams');
    console.log('   hasLink:', hasLink, 'hasUseParams:', hasUseParams);
  }
} catch (e) {
  console.log('��❌ mercado page error:', e.message);
}

console.log(`\nResult: ${passed}/${total} checks passed`);
process.exit(passed === total ? 0 : 1);