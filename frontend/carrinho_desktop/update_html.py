import re

with open('code.html', 'r') as f:
    content = f.read()

# 1. Remove duplicate Material Symbols Outlined link
link = '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>'
# Find all occurrences
parts = content.split(link)
if len(parts) > 1:
    # Keep the first part and one link, then join the rest without the link in between
    content = parts[0] + link + ''.join(parts[1:])

# 2. Change data-alt to alt (already done by previous sed, but just in case)
content = content.replace('data-alt=', 'alt=')

# 3. Change the subtotal span to have id="subtotal"
# We look for the span that contains the subtotal value (7.850 Kz) and add an id.
# We'll replace the first occurrence of '<span>7.850 Kz</span>' with '<span id="subtotal">7.850 Kz</span>'
content = content.replace('<span>7.850 Kz</span>', '<span id="subtotal">7.850 Kz</span>', 1)

# 4. Change the total span to have id="total"
content = content.replace('<span class="font-headline-xl text-headline-xl text-primary">9.050 Kz</span>', 
                          '<span id="total" class="font-headline-xl text-headline-xl text-primary">9.050 Kz</span>', 1)

# 5. Replace the last script tag (the one that is not the tailwind-config) with the new script.
# We'll find the last occurrence of '<script>' and the following '</script>' and replace that block.
# We'll assume that the last script tag is the one we want to replace.
# We'll use a regex to find the last script tag and its content.
# We'll replace from the last '<script>' to the next '</script>' with our new script.

# Define the new script
new_script = '''<script>
// Micro-interactions and hover logic
document.querySelectorAll('tr').forEach(row => {
    row.addEventListener('mouseenter', () => {
        row.style.transform = 'translateX(4px)';
        row.style.transition = 'transform 0.2s ease-out';
    });
    row.addEventListener('mouseleave', () => {
        row.style.transform = 'translateX(0)';
    });
});

// Search highlight effect
const searchInput = document.querySelector('input[type="text"]');
searchInput.addEventListener('focus', () => {
    searchInput.parentElement.classList.add('scale-[1.01]');
});
searchInput.addEventListener('blur', () => {
    searchInput.parentElement.classList.remove('scale-[1.01]');
});

// Cart quantity update and total calculation
function updateQty(btn, change) {
    const qtySpan = btn.parentElement.querySelector('.qty');
    let currentQty = parseInt(qtySpan.innerText);
    currentQty = Math.max(1, currentQty + change);
    qtySpan.innerText = currentQty;

    // Update the total
    updateTotal();

    // Micro-interaction
    btn.classList.add('scale-90');
    setTimeout(() => btn.classList.remove('scale-90'), 150);
}

function formatCurrency(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " Kz";
}

function updateTotal() {
    let subtotal = 0;
    document.querySelectorAll('.qty').forEach(qtySpan => {
        const itemDiv = qtySpan.closest('.p-md.flex.items-center.gap-md.group');
        const priceText = itemDiv.querySelector('.text-right p:first-child').textContent;
        const price = parseInt(priceText.replace(/\./g, '').replace(' Kz', ''), 10);
        const quantity = parseInt(qtySpan.innerText, 10);
        subtotal += price * quantity;
    });

    const subtotalSpan = document.getElementById('subtotal');
    subtotalSpan.textContent = formatCurrency(subtotal);

    const deliveryFee = 1500;
    const discount = 300;
    const total = subtotal + deliveryFee - discount;
    const totalSpan = document.getElementById('total');
    totalSpan.textContent = formatCurrency(total);
}
</script>'''

# Find the last script tag
# We'll use a regex to find the last <script> and its closing </script>
# We'll replace that block with new_script.
# We'll do it by finding the last occurrence of '<script>' and then the next '</script>' after that.
last_script_start = content.rfind('<script>')
if last_script_start != -1:
    # Find the closing tag after this start
    script_end = content.find('</script>', last_script_start)
    if script_end != -1:
        # Replace the old script block with the new script
        content = content[:last_script_start] + new_script + content[script_end + len('</script>'):]

with open('code.html', 'w') as f:
    f.write(content)

print('HTML updated successfully.')
