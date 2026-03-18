# ICU Brain Sheet Design Plan

## Overview
**Objective**: Design a single-patient ICU brain sheet that addresses research-identified needs: depth over breadth, hourly tracking, integrated drip/vent flow sheets, ADHD-friendly visual organization, and MedSurg/ER design aesthetic consistency.

**Deliverable**: Portrait 8.5×11" printable sheet with 24-hour tiered grid, color-coded sections, and integrated flow sheets.

## Core Design Principles

1. **One Patient Per Page**: Maximize detail space, reduce cognitive load.
2. **Hourly Tracking**: 24-column grid with shaded alternating hours.
3. **Integrated Flow Sheets**: Drip and ventilator tracking within same page.
4. **ADHD-Friendly Visual Design**: Color coding, clear hierarchy, checklist mentality.
5. **Consistent Aesthetic**: Align with MedSurg/ER design language (clean, professional, high contrast).

## Layout Specifications

### Page Dimensions
- **Orientation**: Portrait
- **Size**: 8.5" × 11" (standard letter)
- **Margins**: 0.25" on all sides (print-safe)
- **Grid**: 24 columns (hours 00–23) + header column for parameters.

### Section Structure (Top to Bottom)

1. **Header** (Patient Identification, Shift Info)
   - Patient name, MRN, room, allergies, code status
   - Nurse name, shift date/time

2. **Hemodynamics Section** (Red theme)
   - Vital signs grid: BP, HR, MAP, CVP, SpO₂, temp, RR
   - 24-hour hourly tracking with trend arrows
   - Color: Light red background (#ffeaea) with dark red borders (#c0392b)

3. **Respiratory/Ventilator Section** (Blue theme)
   - Vent settings grid: Mode, FiO₂, PEEP, TV, RR, PIP, Pplat
   - Changes log with timestamps
   - Color: Light blue background (#eaf2f8) with dark blue borders (#2980b9)

4. **Neurological Section** (Green theme)
   - GCS, pupil checks (size, reaction), sedation (RASS), pain scores
   - Hourly checkboxes for assessments
   - Color: Light green background (#eaf7ea) with dark green borders (#27ae60)

5. **I&O/Fluids Section** (Yellow theme)
   - Intake (IV fluids, enteral, blood products) with hourly totals
   - Output (urine, drains, emesis) with hourly totals
   - Cumulative balance column
   - Color: Light yellow background (#fff9e6) with dark yellow borders (#f39c12)

6. **Labs Section** (Purple theme)
   - Key labs: ABG (pH, pCO₂, pO₂, HCO₃), electrolytes, CBC, lactate
   - Space for results and trend arrows
   - Color: Light purple background (#f4e6f7) with dark purple borders (#8e44ad)

7. **Drip Flow Sheet** (Integrated within hemodynamics or separate)
   - Table: Medication, Rate, Titration, Dose/hr, Comments
   - Color coding by drug class (vasopressors red, sedatives blue, etc.)

8. **Notes & Assessments** (Neutral theme)
   - Space for narrative notes, plan, to-do checklist
   - Color: Light gray background (#f8f9fa) with gray borders (#95a5a6)

### Hourly Grid Design
- **Columns**: 24 hours (00–23) each 0.3" wide.
- **Row height**: 0.2" per parameter.
- **Shading**: Alternating hours light gray (#f2f2f2) vs white.
- **Trend arrows**: Up/down arrows for changes (↑↓) placed in cells.
- **Checkboxes**: For neuro checks, assessments.

## Color Coding System

| Section | Primary Color | Background | Border | Purpose |
|---------|---------------|------------|--------|---------|
| Hemodynamics | #c0392b | #ffeaea | #c0392b | Critical vitals |
| Respiratory | #2980b9 | #eaf2f8 | #2980b9 | Vent settings |
| Neurological | #27ae60 | #eaf7ea | #27ae60 | Neuro checks |
| I&O/Fluids | #f39c12 | #fff9e6 | #f39c12 | Intake/output |
| Labs | #8e44ad | #f4e6f7 | #8e44ad | Lab results |
| Drips | #c0392b (varies) | #ffeaea | #c0392b | Medications |
| Notes | #95a5a6 | #f8f9fa | #95a5a6 | General notes |

**Legend**: Include a small color legend at bottom of page.

## Typography

- **Font family**: Segoe UI, system-ui, -apple-system, sans-serif
- **Base font size**: 7.5pt (print optimized)
- **Heading size**: 9pt bold
- **Parameter labels**: 7pt bold
- **Grid values**: 7pt regular
- **Line height**: 1.15 (tight but readable)

## Visual Cues

1. **Trend arrows**: Small up/down arrows within grid cells.
2. **Icon indicators**: Warning icon (⚠️) for abnormal values.
3. **Bold borders**: Around each section for quick scanning.
4. **Checkboxes**: Square boxes [ ] for task completion.
5. **Zebra striping**: Light shading for alternating rows within sections.

## ADHD-Friendly Features

- **Color coding**: Immediate section identification.
- **Checklist mentality**: Boxes to check off completed hourly tasks.
- **Minimalist design**: Avoid visual clutter, use whitespace.
- **Consistent layout**: Same section order every page.
- **High contrast**: Black text on light backgrounds.

## Integration with Existing Designs

- **MedSurg/ER aesthetic**: Use same color palette (primary blue, accent red, muted greens).
- **Grid system**: Similar condensed but readable hourly grid.
- **Professional look**: Clean lines, no decorative elements.
- **Print-optimized**: No bleed, standard letter size.

## Mockup Outline

Create an HTML/CSS mockup with:
1. Page container with portrait dimensions
2. Section divs with color-coded headers
3. 24-column grid using CSS grid or table
4. Sample data for each section
5. Print stylesheet for accurate printing

## Next Steps

1. **Create HTML mockup** with basic structure.
2. **Populate with sample data** to test layout.
3. **Test print layout** on PDF.
4. **Iterate** based on feedback.

---
**Design by**: Luna (Digital Team Member)
**Date**: 2026-03-16
**Based on research analysis**: ICU Sheet Analysis & Recommendations