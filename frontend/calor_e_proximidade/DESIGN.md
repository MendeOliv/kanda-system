---
name: Calor e Proximidade
colors:
  surface: '#fff8f5'
  surface-dim: '#e1d8d4'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ed'
  surface-container: '#f5ece7'
  surface-container-high: '#efe6e2'
  surface-container-highest: '#e9e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#564334'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#897362'
  outline-variant: '#ddc1ae'
  surface-tint: '#904d00'
  primary: '#904d00'
  on-primary: '#ffffff'
  primary-container: '#ff8c00'
  on-primary-container: '#623200'
  inverse-primary: '#ffb77d'
  secondary: '#60603e'
  on-secondary: '#ffffff'
  secondary-container: '#e6e5b9'
  on-secondary-container: '#666643'
  tertiary: '#77574d'
  on-tertiary: '#ffffff'
  tertiary-container: '#c8a195'
  on-tertiary-container: '#53382f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc3'
  primary-fixed-dim: '#ffb77d'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6e3900'
  secondary-fixed: '#e6e5b9'
  secondary-fixed-dim: '#cac99f'
  on-secondary-fixed: '#1d1d03'
  on-secondary-fixed-variant: '#484828'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#e7bdb1'
  on-tertiary-fixed: '#2c160e'
  on-tertiary-fixed-variant: '#5d4037'
  background: '#fff8f5'
  on-background: '#1e1b18'
  surface-variant: '#e9e1dc'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
This design system is built on the principles of community, hospitality, and local warmth. It is designed to evoke the sensory experience of a neighborhood marketplace—smelling fresh bread, seeing vibrant produce, and feeling a personal connection with the merchant. 

The aesthetic blends **Minimalism** with **Tactile** influences. It uses generous whitespace to let the warm palette breathe while employing organic, soft-edged containers that feel approachable rather than industrial. The emotional response should be one of safety, reliability, and the comfort of family-oriented shopping.

## Colors
The palette is centered around the "Harvest Duo" of Deep Orange and Rich Cream. 

*   **Primary (#FF8C00):** Used for primary actions, highlights, and brand moments. It represents energy and the sun.
*   **Secondary (#FFFDD0):** This Cream tone replaces pure white as the primary background color for surfaces and page containers, reducing eye strain and providing a "homey" feel.
*   **Tertiary (#5D4037):** An "Earth Brown" used for secondary accents or icons to ground the brighter orange.
*   **Neutral (#2D2926):** A warm charcoal used for high-contrast text and structural elements, ensuring readability without the harshness of pure black.

## Typography
Montserrat is used across all levels to maintain a modern yet friendly geometric character. 

For headlines, use tighter letter-spacing and heavier weights to create a sense of confidence and presence. Body text should maintain standard tracking to ensure legibility during long-form reading, such as product descriptions or recipes. The "label-md" role is specifically designed for navigation and categories, utilizing a semi-bold weight to guide the user's eye through the interface hierarchy.

## Layout & Spacing
This design system utilizes a **Fluid Grid** with fixed maximum constraints. 

- **Desktop:** A 12-column grid with a 1200px max-width. Margins are set to 48px to allow the "Creme" background to frame the content comfortably.
- **Tablet:** 8-column grid with 32px margins. 
- **Mobile:** 4-column grid with 16px margins.

Spacing follows an 8px base unit. Use larger "lg" and "xl" values between sections to emphasize the "Minimalist" clarity of the design. Horizontal spacing (gutters) should remain consistent to maintain a clear vertical rhythm.

## Elevation & Depth
Depth is achieved through **Tonal Layers** rather than heavy shadows. 

The base of the application is the Secondary color (Creme). Surface elements (cards, modals) use a pure White (#FFFFFF) to gently lift them off the background. 

Where shadows are necessary for interactivity (e.g., a button press or a hovering card), use **Ambient Shadows**: ultra-soft, low-opacity blurs tinted with the Primary color (#FF8C00) at 5-10% opacity. This avoids "dirty" grey shadows and maintains the warm, sun-drenched aesthetic of the brand.

## Shapes
The shape language is organic and "Rounded." 

Corners are softened to avoid any sharp, aggressive points. This level of roundedness (0.5rem base) applies to buttons, input fields, and small cards. For larger containers like feature sections or hero banners, use `rounded-xl` (1.5rem) to create a "bubble" or "pillow" effect that enhances the feeling of softness and approachability.

## Components
Consistent application of the "Calor e Proximidade" philosophy across UI elements:

*   **Buttons:** Primary buttons use the Orange background with White text. Use the `rounded-lg` token. Secondary buttons should be an outline style using the Primary Orange or a solid Earth Brown for high-priority secondary actions.
*   **Cards:** Use a white background on the creme page surface. Borders should be avoided; instead, use a subtle 1px inner stroke in a slightly darker cream or the ambient shadow mentioned in the elevation section.
*   **Input Fields:** Backgrounds should be White with a 2px border that turns Primary Orange on focus. Labels sit comfortably above the field in Earth Brown.
*   **Chips & Tags:** Use high-roundedness (Pill-shaped) for category chips. Use a light tint of the Primary color (10% opacity orange) for the background to keep them subtle.
*   **Lists:** Items should be separated by soft, warm-grey dividers or ample whitespace rather than hard lines. 
*   **Icons:** Use rounded icon sets (e.g., Lucide Rounded or Feather) with a slightly thicker stroke (2px) to match the weight of the Montserrat typeface.