# ER v2 Brain Sheet Fix Plan

## Overview
Merge the best aspects of `er_brain_sheet_v2_final.html` (complete field set, ESI color coding) and `er_brain_sheet_v2_print.html` (print‑optimized layout, modern CSS grid, input fields) while addressing reviewer feedback: missing fields, poor usability, weak visual design, and print overflow risks.

## Base File Selection
**Use `er_brain_sheet_v2_print.html` as the foundation.**  
Why:
- Already structured for landscape printing (`@page { size: landscape }`)
- Uses CSS Grid for patient layout, which is easier to adjust and extend
- Includes a header for unit/date/shift/nurse – important for real‑world use
- Input‑based fields allow both digital filling and clean print‑out lines
- More maintainable CSS (box‑sizing, relative units, print‑specific rules)

## Field Additions & Modifications

### 1. Demographics Section (Expand)
Current: Name, MRN, Room  
Add:
- **Age** (years)
- **Sex** (M/F/Other) – radio buttons or checkbox
- **Weight** (kg/lb) – with unit toggle?
- **DOB** (optional) – may be redundant with Age
- **Attending Physician** (short input)

### 2. Vitals (Expand)
Current: BP, HR, RR, SpO₂, Temp  
Add:
- **Pain** (0‑10 scale)
- **Glucose** (mg/dL)
- **GCS** (Eye / Verbal / Motor) – three small inputs
- **Rhythm** (NSR, AFib, etc.) – dropdown or text
- **IV Access** (site/gauge) – text

### 3. Allergies (Enhance)
Current: single‑line text input  
Change to:
- **NKDA checkbox** (pre‑checked)
- **Allergy list** (multi‑line textarea with placeholder “Penicillin, Sulfa, …”)

### 4. Tasks & Labs (Separate)
Current: “Pending Tasks/Labs” single line  
Split into:
- **Pending Tasks** (e.g., “CT head”, “IV start”, “consult”) – checkbox list with custom entry
- **Pending Labs** (e.g., “CBC”, “BMP”, “Troponin”) – checkbox list with custom entry
- **Results Awaiting** (text area)

### 5. Medications (Expand)
Current: “Meds Due” single line  
Change to:
- **Scheduled Meds** (table with time, medication, dose, route, given?)
- **PRN Meds** (list)
- **IV Fluids** (type, rate, volume)

### 6. Notes (Enhance)
Current: small textarea  
Expand to:
- **Nursing Notes** (larger textarea)
- **Provider Notes** (smaller area for MD/PA comments)
- **Disposition** (Admit, Discharge, Transfer) – radio buttons

### 7. ESI Acuity (Improve)
Current: five numbered boxes (print) / five checkboxes (final)  
Merge approach:
- Keep the five numbered boxes but **add background color coding** (ESI 1: red, ESI 2: orange, ESI 3: yellow, ESI 4: light green, ESI 5: light blue)
- Make boxes clickable (JavaScript) to toggle a checkmark or fill color for quick digital use.
- Ensure colors are print‑friendly (pastel shades).

## Visual Design Improvements

### Color Scheme
- **Primary background**: `#f8f9fa` (light gray) for screen, white for print
- **Header bar**: `#005b96` (professional blue) with white text
- **Patient card border**: `#b0bec5` (light gray‑blue)
- **ESI colors** (as above): use pastel versions for print (`#ffcdd2`, `#ffe0b2`, `#fff9c4`, `c8e6c9`, `#bbdefb`)
- **Accent**: `#00acc1` (teal) for important labels

### Typography
- **Headings**: ‘Segoe UI Semibold’, fallback to ‘Tahoma’, ‘Verdana’, sans‑serif
- **Body**: ‘Segoe UI’, fallback to ‘Arial’, sans‑serif
- **Monospace for codes**: ‘Consolas’, ‘Courier New’
- **Font sizes**:
  - Title: 16pt (print) / 1.5rem (screen)
  - Patient header: 11pt / 1.1rem
  - Field labels: 9pt / 0.9rem (bold)
  - Input text: 9pt / 0.9rem

### Spacing & Layout
- **Grid gap**: 0.2in between patient cards (print), 1rem (screen)
- **Field margin**: 0.05in bottom (print), 0.3rem (screen)
- **Input padding**: 0.02in (print), 0.15rem (screen)
- **Card padding**: 0.1in (print), 0.75rem (screen)

### Patient Card Redesign
- Use CSS Grid for internal layout: label‑input pairs in a two‑column grid.
- Group related fields (Demographics, Vitals, Allergies, Tasks, Meds, Notes) with subtle sub‑headings.
- Ensure each patient card is **page‑break‑inside: avoid**.
- On screen, hover effect for patient card (light shadow).

## Print Optimization Steps

1. **Set explicit print margins** in `@page`: `margin: 0.5in;`
2. **Use relative units** (`in`, `pt`) for print‑specific styles, `rem` for screen.
3. **Hide interactive elements** in print:
   - Remove checkboxes, show filled circles for selected ESI.
   - Replace input borders with underlines.
   - Hide custom “Add” buttons for tasks/labs.
4. **Ensure no overflow**:
   - Test with `width: 100%` and `max‑width: 10.5in` for landscape letter.
   - Use `word‑break: break‑word` for long text.
   - Set `overflow: hidden` on patient cards.
5. **Add print‑only headers/footers**:
   - Repeat unit/date/shift/nurse on each page.
   - Page numbers.

## Implementation Specifications for Coder

### HTML Structure
```html
<div class="page">
  <header class="sheet-header">…</header>
  <div class="patient-grid">
    <!-- repeat ×8 -->
    <article class="patient-card" data-patient="1">
      <div class="patient-header">
        <h3>Patient 1</h3>
        <div class="esi-selector">…</div>
      </div>
      <div class="demographics grid-2col">…</div>
      <div class="vitals grid-5col">…</div>
      <div class="allergies">…</div>
      <div class="tasks">…</div>
      <div class="meds">…</div>
      <div class="notes">…</div>
    </article>
  </div>
</div>
```

### CSS Requirements
- Use CSS Grid for overall layout and internal sections.
- Define print styles in `@media print` block.
- Use CSS custom properties for colors:
  ```css
  :root {
    --color-esi-1: #ffcdd2;
    --color-esi-2: #ffe0b2;
    --color-esi-3: #fff9c4;
    --color-esi-4: #c8e6c9;
    --color-esi-5: #bbdefb;
    --color-primary: #005b96;
    --color-border: #b0bec5;
  }
  ```
- Ensure all interactive states (hover, focus) have appropriate styles.

### JavaScript Enhancements (Optional but Recommended)
- ESI box click toggles selection.
- NKDA checkbox clears allergy textarea.
- “Add” buttons for tasks/labs that append new rows.
- Local storage auto‑save (if used digitally).

### Testing Checklist
- [ ] Print preview on Chrome, Firefox, Safari.
- [ ] PDF export preserves layout and colors.
- [ ] Hand‑writing space adequate (minimum 0.3in height per line).
- [ ] All fields visible without horizontal scroll.
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text).
- [ ] ESI colors distinguishable in grayscale print.

## Deliverables
1. **Single HTML file** (`er_brain_sheet_v3.html`) that works both on screen and in print.
2. **Separate CSS file** (optional) for easier maintenance.
3. **A print‑optimized PDF sample** generated from the HTML.
4. **A brief user guide** (README.md) explaining the layout and how to use the sheet digitally/on paper.

## Timeline & Priorities
1. **Phase 1**: Merge existing files, add missing fields, implement new layout (2‑3 days).
2. **Phase 2**: Apply visual design improvements (1‑2 days).
3. **Phase 3**: Print optimization and cross‑browser testing (1 day).
4. **Phase 4**: Optional JavaScript enhancements (1 day).

---
*Plan created by subagent for ER v2 fix based on reviewer feedback.*  
*Date: 2026‑03‑16*