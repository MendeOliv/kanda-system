import os, re

valid = ['/', '/login', '/mercado', '/carrinho', '/pedido-confirmado', '/perfil',
         '/sobre', '/contactos', '/perguntas-frequentes', '/entregas', '/devolucoes',
         '/termos', '/privacidade', '/admin/pedidos']

root = 'src/app/[locale]'
files = []
for dirpath, dirnames, filenames in os.walk(root):
    for fn in filenames:
        if fn in ('page.tsx', 'layout.tsx'):
            files.append(os.path.join(dirpath, fn))

for p in ['src/components/Header.tsx', 'src/components/Footer.tsx', 'src/components/MobileBottomNav.tsx']:
    if os.path.exists(p):
        files.append(p)

issues = []
checked = 0
href_pat = re.compile(r'href=\{?\s*(?:"([^"]+)"|`([^`]+)`)\s*\}?')

for f in sorted(set(files)):
    checked += 1
    with open(f, encoding='utf-8') as fh:
        src = fh.read()
    for m in href_pat.finditer(src):
        h = m.group(1) or m.group(2)
        if not h or h.startswith('#') or h.startswith('mailto:') or h.startswith('http'):
            continue
        base = h.split('?')[0]
        if '${' in base:
            # Template literal e.g. ${locale}/mercado -> strip dynamic segment
            base = re.sub(r'\$\{[^}]*\}', '', base)
            base = base.replace('//', '/')
            if not base.startswith('/'):
                base = '/' + base
        if base.startswith('/pt-AO'):
            base = base[len('/pt-AO'):] or '/'
        elif re.match(r'^/[a-z]{2}(-[A-Z]{2})?/', base):
            base = '/' + base.split('/', 2)[2]
        if base == '':
            base = '/'
        if base not in valid:
            issues.append('%s -> href=%r (base=%r)' % (f, h, base))

print('Files checked: %d' % checked)
if issues:
    print('ISSUES:')
    for i in issues:
        print('  -', i)
else:
    print('OK - all internal links point to valid routes')