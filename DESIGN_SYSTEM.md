# DESIGN_SYSTEM.md

# Eterna Vida — Design System

This document defines the visual system, design tokens, motion principles, component rules, and implementation standards for the Eterna Vida project.

This system is built from the supplied brand and store references, with the following interpretation:

* **Graphic priority:** Apple Human Interface Guidelines style direction for clarity, hierarchy, calm premium presentation, and visual restraint.
* **Token and component architecture:** Material-style thinking for scalable design tokens, semantic roles, and reusable component systems.
* **Backend and operational structure:** Atlassian and Carbon-inspired clarity, density control, table discipline, and predictable admin patterns.
* **Typography:** Google Sans as the primary voice.
* **Motion:** Framer Motion for subtle, premium, non-disruptive transitions.

This is not a copy of those systems. It is an Eterna Vida-specific design language.

---

# 1. Brand Interpretation

## 1.1 Core Visual Personality

Eterna Vida is not a dark luxury brand and not a cold clinical brand.

It sits in a refined position between:

* natural wellness
* premium botanical retail
* clean contemporary elegance
* architectural sophistication
* high-end but warm approachability

## 1.2 What the provided references communicate

From the supplied references, the brand language is clearly built around:

* luminous whites and warm light neutrals
* deep forest green as the primary brand energy
* rich gold or champagne metallic accents
* rounded architectural forms
* circular and arched framing devices
* soft premium retail display behavior
* high visual cleanliness
* bright, optimistic, curated presentation

## 1.3 Emotional Goal

The interface should feel:

* clean
* premium
* organized
* trustworthy
* fresh
* calm
* elegant
* modern

It must never feel:

* cluttered
* overly playful
* heavy
* dark luxury
* generic medical template
* aggressive e-commerce

---

# 2. Visual Direction

## 2.1 Primary Style Direction

The public-facing frontend must prioritize:

* Apple-like cleanliness
* strong whitespace
* restrained hierarchy
* polished typography
* soft premium composition
* calm interactions

## 2.2 Brand Geometry

The brand language strongly suggests these recurring shapes:

* circles
* arches
* capsules
* rounded rectangles
* soft vertical frames
* symmetrical display compositions

These forms should influence UI containers, cards, badges, image crops, and section framing.

## 2.3 Design Metaphor

The physical store acts as a spatial design reference.

That means the digital system should borrow from:

* illuminated shelving logic
* framed product display structure
* premium clinic-retail balance
* layered white + lime + gold composition
* rounded and architectural compartmentalization

---

# 3. Color System

The palette below is derived from the submitted visual references and normalized into product-ready token roles.

## 3.1 Core Palette

### Brand Green Scale

```txt
brand-green-50   #E8F2EA
brand-green-100  #C5DCC9
brand-green-200  #9EC5A4
brand-green-300  #6FAA7A
brand-green-400  #3D8F50
brand-green-500  #0B5D1E
brand-green-600  #0A521A
brand-green-700  #084616
brand-green-800  #063A12
brand-green-900  #042E0E
```

### Signature Gold

```txt
gold-100  #F7EFD9
gold-200  #EFDBA6
gold-300  #E5B85C
gold-400  #D6A03A
gold-500  #C58A1D
```

### Warm Neutrals

```txt
neutral-0    #FFFFFF
neutral-25   #FAF8F3
neutral-50   #F5F2EA
neutral-100  #EFEADF
neutral-200  #E3DBCC
neutral-300  #D9D2C5
neutral-400  #BFB5A3
neutral-500  #9B927F
neutral-600  #6F675C
neutral-700  #4B463F
neutral-800  #2E2B27
neutral-900  #171614
```

### Functional Dark Text

```txt
ink-900  #2D2D2D
ink-800  #363636
ink-700  #404040
```

## 3.2 Color Roles

Use semantic roles rather than raw palette values directly.

### Brand Roles

```txt
color.brand.primary        = brand-green-500   #0B5D1E
color.brand.primaryHover   = brand-green-600   #0A521A
color.brand.primarySoft    = brand-green-50    #E8F2EA
color.brand.gold           = gold-500          #C58A1D
color.brand.goldLight      = gold-300          #E5B85C
```

### Surface Roles

```txt
color.surface.canvas       = neutral-0         #FFFFFF
color.surface.subtle       = neutral-25        #FAF8F3
color.surface.soft         = neutral-50        #F5F2EA
color.surface.elevated     = #FFFFFF
color.surface.brandTint    = brand-green-50    #E8F2EA
```

### Text Roles

```txt
color.text.primary         = ink-900           #2D2D2D
color.text.secondary       = neutral-700       #4B463F
color.text.muted           = neutral-500       #9B927F
color.text.inverse         = #FFFFFF
color.text.brand           = brand-green-500   #0B5D1E
```

### Border Roles

```txt
color.border.soft          = neutral-100       #EFEADF
color.border.default       = neutral-200       #E3DBCC
color.border.strong        = neutral-300       #D9D2C5
color.border.brand         = brand-green-200   #9EC5A4
```

### State Roles

```txt
color.state.success        = brand-green-500   #0B5D1E
color.state.warning        = #D1A530
color.state.error          = #C94A4A
color.state.info           = #3D7EDB
```

## 3.3 Usage Rules

* Deep forest green (#0B5D1E) is the main brand driver.
* Gold (#C58A1D / #E5B85C) is the premium accent: CTAs, highlights, featured badges.
* Gold gradient is used for high-emphasis CTAs (comprar, agregar al carrito, suscribirse).
* Large surfaces should remain white or warm off-white (#FAF8F3).
* Heavy dark backgrounds should be avoided in the public brand experience.

---

# 4. Typography System

## 4.1 Primary Typeface

**Google Sans** is the primary type family.

Recommended fallback stack:

```txt
"Google Sans", "Inter", "SF Pro Display", "Segoe UI", sans-serif
```

## 4.2 Typographic Personality

Typography should feel:

* modern
* elegant
* clean
* airy
* legible
* premium

It should avoid looking:

* condensed and aggressive
* overly geometric and cold
* too editorial or ornamental

## 4.3 Type Scale

```txt
display-xl   64 / 72 / -0.03em / 500
display-lg   56 / 64 / -0.03em / 500
headline-xl  48 / 56 / -0.025em / 500
headline-lg  40 / 48 / -0.02em / 500
headline-md  32 / 40 / -0.02em / 500
headline-sm  28 / 36 / -0.015em / 500

section-xl   24 / 32 / -0.01em / 500
section-lg   20 / 28 / -0.01em / 500
section-md   18 / 26 / -0.005em / 500

body-lg      18 / 30 / 0em / 400
body-md      16 / 28 / 0em / 400
body-sm      14 / 22 / 0em / 400
label-lg     16 / 24 / 0.02em / 500
label-md     14 / 20 / 0.02em / 500
label-sm     12 / 16 / 0.04em / 500
caption      11 / 16 / 0.05em / 500
```

## 4.4 Typographic Rules

* Headlines should be calm and spacious.
* Use sentence case by default.
* Use all caps sparingly for micro-labels, pills, or controlled promotional emphasis.
* Paragraph width should remain comfortable and airy.
* Promotional banners can use stronger weight, but the core website should stay elegant rather than loud.

---

# 5. Spacing System

Use a Material-style token structure with a calm Apple-like visual rhythm.

## 5.1 Spacing Scale

```txt
space-0   = 0
space-1   = 4px
space-2   = 8px
space-3   = 12px
space-4   = 16px
space-5   = 20px
space-6   = 24px
space-8   = 32px
space-10  = 40px
space-12  = 48px
space-16  = 64px
space-20  = 80px
space-24  = 96px
space-32  = 128px
```

## 5.2 Layout Rhythm

* The public site should lean generous.
* Section padding should feel breathable.
* Cards should not feel compressed.
* Backoffice screens may use denser spacing, but still remain visually clean.

---

# 6. Radius and Shape System

The store references strongly justify a rounded and architectural UI language.

## 6.1 Radius Scale

```txt
radius-xs  = 8px
radius-sm  = 12px
radius-md  = 16px
radius-lg  = 20px
radius-xl  = 24px
radius-2xl = 32px
radius-pill = 999px
```

## 6.2 Shape Rules

Use rounded geometry intentionally:

* buttons: pill or large rounded rectangle
* cards: md to xl radius
* feature containers: lg to 2xl radius
* modals: xl radius
* inputs: md to lg radius
* image masks: circle, soft rounded rectangle, or vertical arch where appropriate

## 6.3 Signature Forms

Signature forms for hero sections and promotional surfaces may include:

* circular outlines
* arch-framed image blocks
* capsule highlights
* inset rounded panels

These should be used as system motifs, not random decoration.

---

# 7. Shadows, Borders, and Depth

## 7.1 Depth Philosophy

Depth should be soft, premium, and minimal.

Avoid heavy shadows or exaggerated neumorphism.

## 7.2 Shadow Tokens

```txt
shadow-xs = 0 1px 2px rgba(45,45,45,0.04)
shadow-sm = 0 4px 12px rgba(45,45,45,0.06)
shadow-md = 0 12px 24px rgba(45,45,45,0.08)
shadow-lg = 0 20px 40px rgba(45,45,45,0.10)
shadow-cta = 0 8px 24px rgba(197,138,29,0.25)
```

## 7.3 Border Rules

* Use borders more often than deep shadows.
* Borders should be soft and warm-neutral.
* Brand-green borders may be used for selected or highlighted states.
* Gold borders should remain subtle and premium, never loud.

---

# 8. Motion System

## 8.1 Motion Engine

Use **Framer Motion** for all meaningful animation.

## 8.2 Motion Personality

Motion should feel:

* smooth
* premium
* calm
* lightweight
* intentional

It must never feel:

* flashy
* bouncy in a childish way
* distracting
* overly gamified

## 8.3 Motion Timing Tokens

```txt
motion.instant = 120ms
motion.fast    = 180ms
motion.base    = 240ms
motion.slow    = 320ms
motion.page    = 420ms
```

## 8.4 Easing Tokens

```txt
ease.standard = [0.22, 1, 0.36, 1]
ease.soft     = [0.16, 1, 0.3, 1]
ease.exit     = [0.4, 0, 1, 1]
```

## 8.5 Approved Motion Patterns

* fade + slight upward reveal
* soft scale-in for cards and modals
* smooth accordion height transitions
* understated page-section reveals
* gentle hover elevation on cards and buttons
* image parallax only when it is extremely restrained

## 8.6 Motion Rules

* motion should reinforce hierarchy
* repeated animations should not slow down usage
* do not animate every element
* animation on admin tables and dense workflows must remain minimal

---

# 9. Iconography and Graphic Language

## 9.1 Icon Style

Icons should be:

* simple
* rounded or softly geometric
* modern
* consistent in stroke behavior
* visually light

## 9.2 Decorative Language

Allowed decorative language:

* circular strokes
* soft outlines
* green-tinted gradients
* architectural frames
* subtle gold separators

Disallowed decorative language:

* random abstract blobs
* heavy glassmorphism
* neon styling
* dark cyber effects
* overly ornamental medical clichés

---

# 10. Imagery and Art Direction

## 10.1 Photography Direction

Images should feel:

* bright
* clean
* premium
* natural ingredient-aware
* wellness-adjacent
* calm and precise

## 10.2 Product Imagery

Product imagery should:

* sit on bright clean backgrounds
* maintain alignment and consistency
* support premium retail clarity
* avoid messy cutouts or inconsistent shadows

## 10.3 Environment Imagery

The physical store references should inspire:

* white-dominant layouts
* premium shelving logic
* framed content presentation
* curated product grouping
* vertical rhythm and symmetrical composition

---

# 11. Grid, Layout, and Page Composition

## 11.1 Public Frontend Layout Philosophy

Public pages should follow:

* strong whitespace
* centered composition when appropriate
* controlled content width
* calm section rhythm
* premium editorial clarity

## 11.2 Container Tokens

```txt
container-sm = 640px
container-md = 768px
container-lg = 1024px
container-xl = 1200px
container-2xl = 1320px
```

## 11.3 Section Patterns

Recommended public page sections:

* hero with calm headline + supporting copy + strong CTA
* brand/service overview with structured cards
* product highlight shelf style block
* proof / testimonials / trust indicators
* category or service grid
* clean CTA band

## 11.4 Backend Layout Principles

For internal/admin interfaces, borrow structure from Atlassian and Carbon:

* clear top bars
* disciplined side navigation
* dense but readable table layouts
* explicit filter zones
* visible empty states
* strong form alignment
* predictable status presentation

The admin side should not copy the public brand styling literally.

It should inherit the token system while using a more operational structure.

---

# 12. Component Principles

All components must be reusable, typed, and token-driven.

## 12.1 Component Requirements

All components must:

* be fully typed with TypeScript
* expose props interfaces
* use design tokens instead of hardcoded values
* support state variants where relevant
* avoid tight coupling
* support animation when meaningful
* remain composable

## 12.2 Public vs Admin Styling

Components may have shared foundations but different density modes:

* public mode: more whitespace, more emotional polish
* admin mode: more compact, more operational clarity

---

# 13. Core Component Inventory

## 13.1 Buttons

### Primary Button

Use for high-priority actions.

Style direction:

* pill shape
* brand green fill or ink fill depending on context
* white text on strong fills
* subtle hover lift
* generous horizontal padding

### Secondary Button

* white or soft-neutral surface
* thin border
* dark text
* restrained hover state

### Tertiary / Ghost Button

* minimal fill
* dark or brand text
* used for low-emphasis actions

### Promo CTA Variation

Can borrow from the printed promotion reference:

* large rounded capsule
* strong center alignment
* bold but still clean

## 13.2 Inputs

Inputs should be:

* high-contrast
* softly rounded
* spacious
* cleanly labeled
* never visually cramped

States:

* default
* hover
* focus
* error
* disabled
* success when relevant

## 13.3 Cards

### Product Card

Should feel like a clean shelf unit:

* bright surface
* strong product image zone
* balanced spacing
* concise copy structure
* optional accent badge

### Service Card

* calm icon or image
* clear title
* 2–4 lines supportive copy
* subtle action affordance

### Editorial / Story Card

* larger image ratio
* softer hierarchy
* spacious composition

## 13.4 Navigation

### Header

Public header should be:

* minimal
* premium
* light background
* clean spacing
* restrained dropdown behavior

### Mobile Navigation

* simple layered drawer or sheet
* large tap targets
* no visual clutter

## 13.5 Hero Module

The hero should reflect the brand architecture:

* large calm headline
* premium whitespace
* product, service, or brand feature zone
* optional circular or arched framing device
* restrained motion entrance

## 13.6 Product Shelf / Brand Display Module

Inspired by the physical store shelving system.

Characteristics:

* structured columns
* clear grouping
* elegant headers
* branded separators
* controlled spacing

## 13.7 Modal / Dialog

* rounded xl container
* soft shadow
* strong title hierarchy
* clean actions area
* generous inner spacing

## 13.8 Table System

For admin or inventory surfaces:

* use Carbon/Atlassian discipline
* compact but breathable rows
* sortable headers when relevant
* clear filters
* explicit empty states
* visible row states and actions

## 13.9 Badge and Status Tokens

Badges should be:

* small
* pill-shaped
* text-led
* easy to scan

Use for:

* stock status
* promotion
* category
* featured
* admin states

## 13.10 Section Frames

A signature Eterna Vida block can use:

* soft green tinted background
* large radius
* circular outline accent
* subtle gold divider
* image and text in premium balance

---

# 14. Component Density Modes

## Public / Brand Density

Use:

* larger spacing
* softer hierarchy
* more emotion
* more visual breathing room

## Admin / Operational Density

Use:

* tighter spacing
* higher information density
* stronger table discipline
* less decorative framing
* more explicit states and labels

---

# 15. Accessibility Rules

The system must remain accessible while preserving its premium feel.

At minimum:

* maintain readable color contrast
* ensure focus states are clearly visible
* use semantic structure
* label all meaningful controls
* do not rely on color alone for important status meaning
* keep motion optional and respectful of reduced-motion needs

---

# 16. Token Implementation Structure

Recommended token grouping:

```txt
tokens/
  color.ts
  spacing.ts
  typography.ts
  radius.ts
  shadow.ts
  motion.ts
  breakpoints.ts
  zIndex.ts
```

## Example Semantic Token Shape

```ts
export const tokens = {
  color: {
    brand: {
      primary: '#0B5D1E',
      primaryHover: '#0A521A',
      soft: '#E8F2EA',
      gold: '#C58A1D',
      goldLight: '#E5B85C',
    },
    surface: {
      canvas: '#FFFFFF',
      subtle: '#FAF8F3',
      soft: '#F5F2EA',
      elevated: '#FFFFFF',
      brandTint: '#E8F2EA',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#4B463F',
      muted: '#9B927F',
      inverse: '#FFFFFF',
      brand: '#0B5D1E',
    },
    border: {
      soft: '#EFEADF',
      default: '#E3DBCC',
      strong: '#D9D2C5',
      brand: '#9EC5A4',
    },
    status: {
      success: '#0B5D1E',
      warning: '#D1A530',
      error: '#C94A4A',
      info: '#3D7EDB',
    },
  },
}
```

This structure should be mirrored in Tailwind theme extension or equivalent token mapping.

---

# 17. Tailwind and Component System Rules

## 17.1 Tailwind Rules

* tokens must be centralized in the Tailwind config or a shared theme layer
* avoid arbitrary values unless truly necessary
* preserve semantic naming where possible
* avoid inline visual improvisation page by page

## 17.2 Component API Rules

Components should expose controlled variants such as:

* size
* tone
* emphasis
* density
* state
* motion preset

Example:

```ts
<Button variant="primary" size="lg" density="brand" />
<Card tone="soft" radius="xl" shadow="sm" />
```

---

# 18. Motion Implementation Rules With Framer Motion

Recommended usage:

* page section reveal wrappers
* animated accordion patterns
* modal transitions
* drawer transitions
* image and content stagger in hero modules
* hover transitions on cards and buttons

Avoid:

* full-page over-animation
* constant looping motion
* exaggerated spring behavior in serious content areas

---

# 19. Frontend and Backend Design Split

## Public Frontend

Influence priority:

1. Apple HIG visual clarity and hierarchy
2. Eterna Vida brand language
3. Material token structure and reusable components

## Admin / Backend Interface

Influence priority:

1. Atlassian and Carbon structure
2. Material-style token consistency
3. Eterna Vida color accents used carefully

Public and admin should feel related, but not identical.

The public side sells trust and brand experience.

The admin side prioritizes operational clarity.

---

# 20. Final Standard

An Eterna Vida interface is correct only if it feels:

* premium without arrogance
* natural without sterility
* fresh without childishness
* elegant without excess
* structured without rigidity
* branded without becoming visually noisy

If a UI is technically clean but does not reflect this emotional balance, it is not aligned with the system.

---

# Version

**DESIGN_SYSTEM.md v2.0**
Eterna Vida Visual System
