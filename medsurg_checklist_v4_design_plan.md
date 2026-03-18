# MEDSURG CHECKLIST v4 - COMPACT LANDSCAPE REDESIGN
## Design Plan

### Overview
Redesign the current portrait-oriented single-patient checklist (`medsurg_checklist_v3.html`) into a landscape-oriented, three-patient-per-page compact checklist optimized for rapid circling and maximal writing space.

### Key Changes from v3
1. **Remove** Patient Information & Shift Details section (entire header)
2. **Keep only** Room number as minimal identification (per patient)
3. **Move** human outline to the top of each patient section
4. **Remove** Vitals & I/O section (replace with blank note space)
5. **Switch to landscape** orientation (11″ × 8.5″)
6. **Compact layout** with three identical patient sections side‑by‑side
7. **Maintain** circling format for quick assessment documentation

### Page Layout (Landscape)
- **Paper size:** 11″ wide × 8.5″ tall (standard US letter landscape)
- **Margins:** 0.25″ all sides (CSS `@page { margin: 0.25in; }`)
- **Sheet usable area:** 10.5″ × 8″ after margins
- **Three columns** (patients) each ~3.5″ wide with 0.25″ gutters

### Patient Section Structure
Each patient section will contain:

```
[Patient Section]
┌─────────────────────────────────────┐
│ Room: ________                      │
├─────────────────────────────────────┤
│         [Human Outline]             │
│        (front/back silhouette)      │
├─────────────────────────────────────┤
│ 1. Mental Status                    │
│    ○ A&O 1 ○ 2 ○ 3 ○ 4 ○ Alert …   │
│    Other: ________________________  │
├─────────────────────────────────────┤
│ 2. IV Fluids                        │
│    ○ LR ○ NS ○ D5W …                │
│    Rate: ○ KVO ○ 50 …               │
│    Site: ○ L AC ○ R AC …            │
│    Status: ○ Patent ○ Infiltrated … │
├─────────────────────────────────────┤
│ 3. Mobility                         │
│    Activity: ○ Ambulate ○ Bedrest … │
│    Assistance: ○ Independent …      │
│    Turning & Skin: ○ Q2h …          │
│    Fall Precautions: ○ Bed alarm …  │
├─────────────────────────────────────┤
│ 4. Pain Scale (0‑10)                │
│    0 1 2 3 4 5 6 7 8 9 10          │
│    No pain  Mild  Mod  Severe Worst │
│    Location: _____________________  │
│    ○ Medicated  Med: _______        │
│    ○ Non‑pharm  ○ Reassess 30min    │
├─────────────────────────────────────┤
│ 5. Common Medications               │
│    Analgesics: ○ Acetaminophen …    │
│    Anticoagulants: ○ Heparin …      │
│    GI & Other: ○ PPI …              │
│    Antibiotics: __________________  │
│    Other: ________________________  │
├─────────────────────────────────────┤
│ 6. Assessments & Interventions      │
│    ○ Neuro checks q___h ○ PERRLA …  │
│    ○ Dressing change ○ Wound vac …  │
│    ○ O2 NC ___ L ○ O2 mask ___ L …  │
│    ○ NPO ○ Clear liquids …          │
│    ○ Bowel movement ○ I&O …         │
├─────────────────────────────────────┤
│ 7. Blank Space for Notes            │
│    ________________________________ │
│    ________________________________ │
│    ________________________________ │
│    ________________________________ │
└─────────────────────────────────────┘
```

### Visual Design
- **Color scheme:** Retain subtle color‑coded section headers (same hues as v3) but reduce saturation for better print economy.
- **Font:** Segoe UI / system‑ui, 7 pt base size (compact).
- **Section borders:** 1.5 pt solid with colored header strip.
- **Circling format:** Replace plain text with clickable (printable) circles (`○`). In digital version, circles toggle fill.
- **Human outline:** Simplified SVG (front/back) centered, symbol key removed (assume staff know standard symbols). Outline may be scaled down to fit column width.
- **Room number:** Single input field at top‑right of each section, labeled “Room:”.

### CSS Architecture
```css
@page {
  size: 11in 8.5in landscape;
  margin: 0.25in;
}

body {
  font-family: "Segoe UI", system-ui, sans-serif;
  font-size: 7pt;
  line-height: 1.2;
  color: #1a1a1a;
  background: white;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.sheet {
  width: 10.5in;   /* 11in - 2×0.25in */
  height: 8in;     /* 8.5in - 2×0.25in */
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  gap: 0.25in;     /* gutter between patient columns */
}

.patient-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Room header */
.room-header {
  text-align: right;
  margin-bottom: 2px;
}

/* Human outline */
.human-outline svg {
  width: 100%;
  max-height: 1.2in;
  stroke: #34495e;
  fill: none;
}

/* Section styling (reuse v3 color classes with compact padding) */
.section {
  border: 1.5px solid;
  border-radius: 3px;
  padding: 3px;
  page-break-inside: avoid;
  background: white;
}

.section h4 {
  font-size: 7.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
  color: white;
  padding: 2px 3px;
  border-radius: 1px;
}

/* Checklist items */
.checklist {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  margin-bottom: 2px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.check-circle {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid currentColor;
  cursor: pointer;
}

.check-circle.selected {
  background-color: currentColor;
}

/* Text inputs */
.text-input {
  border: none;
  border-bottom: 1px solid #95a5a6;
  background: transparent;
  font-size: 7pt;
  padding: 1px 2px;
  font-family: inherit;
}

/* Pain scale visual (compact) */
.pain-scale-visual {
  display: flex;
  justify-content: space-between;
  margin: 3px 0;
}

.pain-number {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #c0392b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6pt;
  font-weight: 600;
  cursor: pointer;
}

/* Notes area */
.notes-area {
  width: 100%;
  height: 1.5in;
  border: 1px dashed #bdc3c7;
  background: #f8f9fa;
  font-size: 7pt;
  padding: 3px;
  resize: none;
}
```

### Implementation Steps
1. **Create new HTML file** `medsurg_checklist_v4.html`.
2. **Update `<style>` block** with landscape‑oriented CSS and compact layout.
3. **Build single‑patient column template** with the seven sections (room, outline, mental status, IV fluids, mobility, pain scale, common meds, assessments, notes).
4. **Duplicate the column** three times inside a `.sheet` flex container.
5. **Add minimal JavaScript** for circle toggling (pain scale, checklist circles) if digital interactivity is desired.
6. **Test print layout** in browser and adjust spacing to ensure three columns fit without overflow.
7. **Optionally** create a PDF generation script.

### Design Rationale
- **Removing administrative overhead** (patient info, shift details) saves ~0.5″ vertical space per patient.
- **Human outline at top** provides immediate visual reference for marking without scrolling.
- **Eliminating vitals table** frees substantial space for handwritten notes; vitals are often recorded on separate flowsheets.
- **Landscape + three columns** maximizes paper utility, allowing one page to cover three patients—ideal for shift‑to‑shift handoff.
- **Circling format** reduces writing time; staff can quickly circle relevant items.
- **Compact but readable** 7 pt font is legible when printed and allows dense information packing.

### Potential Issues & Mitigations
- **Overcrowding:** If sections become too tight, reduce vertical gaps or adjust font size to 7.5 pt.
- **Print margins:** Some printers may clip edges; ensure gutters are sufficient.
- **Circle size:** Ensure circles are large enough to be circled with a pen (minimum 8 pt diameter).
- **Color printing:** If black‑and‑white printing is expected, ensure sections are distinguishable by border style or grayscale background.

### Deliverable
- A single HTML file (`medsurg_checklist_v4.html`) that renders three identical patient sections side‑by‑side in landscape orientation, ready for printing.
- Optional CSS print‑only optimizations.

### Next Steps
After approval of this design plan, proceed with implementing the HTML/CSS structure.