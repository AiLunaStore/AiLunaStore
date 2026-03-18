# ER Nurse Brain Sheet v2 - Real-World Design

## Overview
A minimalist, printable brain sheet designed for Emergency Department nurses managing 4-8 patients simultaneously. The template prioritizes critical information, uses a clean grid layout, and supports hybrid paper‑digital workflow with ample writing space.

## Design Goals
- **One‑page summary** for 4‑8 patients (typical ER load)
- **Minimalist layout** – only essential fields, no clutter
- **Hybrid workflow** – paper for quick notes, structured but flexible
- **Critical data prioritized** as identified by ER nursing research
- **Landscape 11×8.5"** – standard office printing
- **Grid layout** – clear visual separation between patients
- **Larger fonts** – readable at a glance, not tiny
- **Clean boundaries** – no overflow, no crowded fields
- **Practical, not theoretical** – designed for real‑world use

## Critical Fields (Per Patient)
1. **Patient name, MRN, room** – quick identification
2. **Chief complaint** – why they’re here
3. **Allergies** – safety first
4. **Vitals (current)** – BP, HR, RR, SpO₂, Temp
5. **Pending tasks/labs** – what’s outstanding
6. **Meds due** – timing and medication
7. **Quick notes space** – free‑text for updates, trends, handoff

## Layout Specifications
- **Orientation:** Landscape
- **Size:** US Letter (11″ × 8.5″)
- **Margins:** 0.5″ all sides (safe printing zone)
- **Grid:** 2 columns × 4 rows = 8 patient slots
- **Cell dimensions:** Each patient cell ≈ 4.75″ wide × 1.75″ tall
- **Fonts:** Sans‑serif (Arial/Helvetica) 10‑12pt for labels, 9‑10pt for input
- **Borders:** Light 0.5pt lines between cells, heavier outer border

## Field Details

### Patient Identification Line
- **Format:** `P1: ______ MRN: ____ Rm: __ ESI: □1□2□3□4□5`
- **Purpose:** Unique patient identifier, location, acuity
- **ESI checkboxes:** Rapid acuity marking (1=resuscitation … 5=non‑urgent)

### Chief Complaint (CC)
- **Label:** `CC: _______________________________________`
- **Space:** ~40 characters for brief description

### Allergies
- **Label:** `Allerg: ___________________________________`
- **Space:** ~40 characters for common allergens (NKDA, PCN, etc.)

### Current Vitals
- **Label:** `Vitals: BP___/___ HR___ RR___ SpO₂___% T___°C`
- **Format:** Pre‑labeled slots for systolic/diastolic BP, heart rate, respiratory rate, oxygen saturation, temperature
- **Design:** Compact inline layout saves vertical space

### Pending Tasks/Labs
- **Label:** `Pending: __________________________________`
- **Use:** Write pending labs (CBC, CMP, troponin), imaging (CT, X‑ray), consults, procedures

### Medications Due
- **Label:** `Meds Due: _________________________________`
- **Use:** Medication name, dose, time due (e.g., “vanco 1g @ 14:00”)

### Notes
- **Label:** `Notes: ____________________________________`
- **Use:** Free‑text area for trending observations, family updates, handoff points, disposition

## Printable Considerations
- **Black‑and‑white friendly:** All borders and text are high‑contrast; no color required
- **Toner‑economical:** Light borders, no solid fills
- **Photocopy‑safe:** Font sizes remain readable after copying
- **Lamination‑ready:** Can be laminated for wet‑environment use (dry‑erase marker)

## Hybrid Workflow Support
- **Paper first:** Print, clip to clipboard, write with pen
- **Structured but flexible:** Fields guide documentation but don’t restrict narrative
- **Quick updates:** Easy to add new vitals, check off tasks, note changes
- **Handoff ready:** All critical info on one page for shift change

## Files Included
1. **`er_brain_sheet_v2_grid.txt`** – Text‑based template with box‑drawing borders (monospace preview)
2. **`er_brain_sheet_v2_grid.html`** – Basic HTML version for web viewing/printing
3. **`ER_Nurse_Brain_Sheet_v2_Design.md`** – This design document

## Next Steps (If Developing Further)
1. **High‑fidelity mock‑up** in Figma/Illustrator
2. **Fillable PDF** with locked labels and editable fields
3. **User testing** with ER nursing staff
4. **Iterate** based on feedback (field additions/removals, spacing adjustments)
5. **Color‑coded version** (optional) for ESI acuity

## Design Principles Applied
- **Prioritization:** Only what’s needed, nothing extra
- **Readability:** Larger fonts, clear labels, ample whitespace
- **Usability:** Logical flow, quick to fill out, easy to scan
- **Durability:** Works in fast‑paced, often chaotic ED environment
- **Adaptability:** Can be used for trauma, medical, pediatric, fast‑track patients alike

## Credits
Designed by Luna (Digital Team Member) as a sub‑agent task for OpenClaw.  
Based on research findings and real‑world ER nursing needs.

**Version:** 2.0  
**Date:** 2026‑03‑16  
**Status:** Ready for review and pilot testing