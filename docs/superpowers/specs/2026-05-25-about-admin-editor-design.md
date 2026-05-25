# About Page Admin Editor — Design Spec
_2026-05-25_

## Overview

Add an "About" tab to the admin page (`dawei-admin/index.html`) that lets David edit the About Me bio and testimonials without touching code. The About section in `index.html` is currently fully hardcoded; this feature makes it config-driven like Pricing and Contact already are.

---

## Data Schema

A new `config.about` object is added to `gallery-config.json`:

```json
{
  "about": {
    "bio": "Paragraph one.\n\nParagraph two.\n\nParagraph three.",
    "testimonials": [
      { "id": "t-abc123", "text": "Quote text here.", "name": "Priya S." }
    ]
  }
}
```

### Fields
- `bio` — full multi-paragraph bio string; paragraphs separated by `\n\n`. Rendered as `<p>` tags on the public site.
- `testimonials` — ordered array of objects. Display order = array order.
  - `id` — unique string (generated at creation, e.g. `t-` + timestamp/random)
  - `text` — the quote body
  - `name` — client attribution line

### About photo
The About page photo is **not** stored in `config.about`. It reuses `config.contact.photoPublicId`, which is already managed in the Contact tab. A hint note in the About panel will point the user there.

---

## Migration

`migrateConfig()` in `dawei-admin/index.html` is extended: if `config.about` is absent, it seeds the object with the current hardcoded values (5 bio paragraphs joined by `\n\n`, all 8 existing testimonials with generated IDs). This runs once on first load after deploy; subsequent loads skip it.

---

## Admin UI

### Tab placement
"About" tab is inserted after "Contact" in the tab bar.

### Panel layout

**Toolbar**
- Title: "About Page"
- Save status indicator (same `save-status` pattern as Pricing/Contact)
- "Save Changes" button (calls `saveAboutChanges()`)

**Bio section**
- Label: "Bio"
- Single `<textarea>` (class `editor-textarea`, ~8 rows), pre-filled with `config.about.bio`
- Hint below: "Paragraphs are separated by a blank line."

**About Photo note**
- A small hint line: "To change the About photo, go to the Contact tab → Contact Photo."

**Testimonials section**
- Label: "Testimonials"
- One card per testimonial (class `card-editor`, same style as Pricing cards), containing:
  - Name input (single line, `editor-input`, top of card)
  - Quote textarea (`editor-textarea`, ~4 rows)
  - Up / Down arrow buttons to reorder (disabled at first/last positions)
  - Delete button → uses existing confirm modal
- "＋ Add Testimonial" button below the list → appends a blank card and focuses the Name input

---

## Public Site Changes (`index.html`)

The hardcoded About section HTML is replaced with empty containers that are populated at runtime by `renderAboutSection()`:

```html
<div class="about-bio" id="aboutBio"></div>
<div class="testimonials-grid" id="testimonialsGrid"></div>
```

`renderAboutSection(cfg)` is called inside the existing `loadConfig()` success path:
- Splits `cfg.about.bio` on `\n\n`, wraps each chunk in `<p>`, injects into `#aboutBio`
- Iterates `cfg.about.testimonials`, builds `.testimonial-card` HTML for each, injects into `#testimonialsGrid`
- Falls back to the current hardcoded content if `cfg.about` is absent (defensive, shouldn't happen after migration)

---

## Save Flow

`saveAboutChanges()` in the admin:
1. Reads bio from textarea
2. Reads each testimonial card's name input and quote textarea in DOM order
3. Writes back to `config.about`
4. Calls `saveConfig()` (existing Cloudinary upload)
5. Updates save status indicator

---

## Files Changed

| File | Change |
|------|--------|
| `dawei-admin/index.html` | Add About tab, panel HTML/JS, `migrateConfig` extension, `renderAboutPanel`, `saveAboutChanges` |
| `index.html` | Replace hardcoded About HTML with dynamic containers; add `renderAboutSection()` called from `loadConfig()` |

No backend changes required — `gallery-api.js` already handles `save-config`.
