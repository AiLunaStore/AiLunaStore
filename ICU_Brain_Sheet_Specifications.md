# ICU Brain Sheet Specifications

## Document Purpose
Detailed specifications for each section of the ICU brain sheet, including parameters, grid layout, color coding, and visual design.

## Overall Sheet Specifications

- **Page size**: 8.5" × 11" portrait
- **Margins**: 0.25" on all sides
- **Orientation**: Portrait
- **Font**: Segoe UI, 7.5pt base
- **Color coding**: Per section (see below)
- **Hourly grid**: 24 columns (00–23), shaded alternating hours

## Section 1: Header

### Purpose
Patient identification and shift information.

### Fields
| Field | Example | Width |
|-------|---------|-------|
| Patient name | LAST, First MRN | 50% |
| Room | ICU-12 | 25% |
| Allergies | NKDA | 25% |
| Code status | Full Code | 50% |
| Nurse name | Nurse Name | 25% |
| Shift | Day (07:00-19:00) | 25% |
| Date | 2026-03-16 | 25% |
| ICU Team | Attending, Resident | 50% |

### Design
- Two-column layout
- No background color
- Bottom border: 2px solid primary blue (#1a5276)
- Field labels bold, values underlined dotted

## Section 2: Hemodynamics (Red)

### Purpose
Track vital signs hourly.

### Parameters
| Parameter | Unit | Abbrev | Priority |
|-----------|------|--------|----------|
| Blood Pressure | mmHg | BP | 1 |
| Heart Rate | bpm | HR | 1 |
| Mean Arterial Pressure | mmHg | MAP | 1 |
| Central Venous Pressure | mmHg | CVP | 2 |
| Oxygen Saturation | % | SpO₂ | 1 |
| Temperature | °C | Temp | 2 |
| Respiratory Rate | breaths/min | RR | 2 |

### Grid Layout
- 7 rows × 24 columns
- Each cell: 0.3" wide × 0.2" high
- Row height: 1.4em

### Color Scheme
- **Background**: #ffeaea (light red)
- **Border**: #c0392b (dark red)
- **Title background**: #c0392b with white text

### Integrated Drip Flow Sheet
- Located within hemodynamics section (logical grouping)
- Table with columns: Medication, Rate, Titration, Dose/hr, Comments
- Color coding by drug class (vasopressors red, sedatives blue, etc.)

## Section 3: Respiratory/Ventilator (Blue)

### Purpose
Ventilator settings and respiratory parameters.

### Vent Settings Table
| Setting | Unit | Example |
|---------|------|---------|
| Mode | — | AC/VC |
| FiO₂ | % | 40% |
| PEEP | cmH₂O | 5 |
| Tidal Volume | mL | 450 |
| Respiratory Rate | bpm | 12 |
| Peak Inspiratory Pressure | cmH₂O | 18 |
| Plateau Pressure | cmH₂O | 15 |

### Hourly Tracked Parameters
- FiO₂ (%)
- PEEP (cmH₂O)
- Optional: PIP, TV

### Grid Layout
- 2-3 rows × 24 columns
- Separate vent settings table above grid

### Color Scheme
- **Background**: #eaf2f8 (light blue)
- **Border**: #2980b9 (dark blue)
- **Title background**: #2980b9 with white text

### Change Log Column
- Column for tracking adjustments with timestamps
- Alarm thresholds indicated

## Section 4: Neurological (Green)

### Purpose
Neurological assessments and sedation.

### Checklist Items
- GCS 15
- Pupils equal & reactive
- RASS score
- Pain score
- Sedation hold
- Neuro checks frequency

### Hourly Tracked Parameters
- GCS total
- Pupil reactivity (size + reaction)

### Grid Layout
- 2 rows × 24 columns
- Checklist above grid

### Color Scheme
- **Background**: #eaf7ea (light green)
- **Border**: #27ae60 (dark green)
- **Title background**: #27ae60 with white text

### ADHD-Friendly Features
- Checkboxes for completed assessments
- Visual indicators for changes

## Section 5: Intake & Output (Yellow)

### Purpose
Fluid balance tracking.

### Parameters
| Parameter | Unit | Notes |
|-----------|------|-------|
| IV Fluids | mL | Hourly total |
| Enteral Feeds | mL | Hourly total |
| Blood Products | mL | Hourly total |
| Urine Output | mL | Hourly total |
| Drain Output | mL | Hourly total |
| Emesis/Other Output | mL | Hourly total |
| Cumulative Balance | mL | Running total |

### Grid Layout
- 3 rows × 24 columns (IV fluids, urine output, cumulative balance)
- Additional rows can be added as needed

### Color Scheme
- **Background**: #fff9e6 (light yellow)
- **Border**: #f39c12 (dark yellow)
- **Title background**: #f39c12 with white text

### Balance Calculation
- Automatically calculate cumulative balance (intake - output)
- Highlight negative balances with warning color

## Section 6: Labs (Purple)

### Purpose
Key laboratory results.

### Parameters
| Parameter | Unit | Typical Frequency |
|-----------|------|-------------------|
| pH | — | q6h |
| pCO₂ | mmHg | q6h |
| pO₂ | mmHg | q6h |
| HCO₃ | mmol/L | q6h |
| Lactate | mmol/L | q12h |
| Sodium | mmol/L | Daily |
| Potassium | mmol/L | Daily |
| Creatinine | mg/dL | Daily |
| Hemoglobin | g/dL | Daily |
| WBC | ×10³/µL | Daily |

### Grid Layout
- 2-4 rows × 24 columns (sparse data)
- Cells empty except at lab draw times

### Color Scheme
- **Background**: #f4e6f7 (light purple)
- **Border**: #8e44ad (dark purple)
- **Title background**: #8e44ad with white text

### Trend Indicators
- Up/down arrows for changes
- Abnormal values highlighted with warning icon ⚠️

## Section 7: Notes & Assessments (Gray)

### Purpose
Narrative notes, plan, and to-do checklist.

### Components
- **Checklist**: Common tasks (oral care, turning, lines dressed, etc.)
- **Plan/To-Do**: Free-text area for shift plan
- **Notes**: Space for additional observations

### Design
- Neutral background (#f8f9fa)
- Gray border (#95a5a6)
- Checklist in 2-column grid
- Textarea for free text

### ADHD-Friendly Features
- Checkboxes for task completion
- Clear visual separation from data sections

## Hourly Grid Technical Specifications

### Column Dimensions
- **Total width**: 7.5" (excluding margins and label column)
- **24 columns**: each 0.3125" wide
- **Label column**: 0.75" wide

### Row Dimensions
- **Default row height**: 0.2"
- **Condensed rows**: 0.18" for less critical parameters

### Shading Pattern
- **Odd hours (00,02,04...)**: #f2f2f2 (light gray)
- **Even hours (01,03,05...)**: white
- Enhances visual tracking across row

### Typography
- **Parameter labels**: 7pt bold, left-aligned
- **Grid values**: 7pt regular, center-aligned
- **Abbreviations**: Standard medical abbreviations with legend

### Visual Cues
- **Trend arrows**: ↑ for increase, ↓ for decrease (small Unicode arrows)
- **Warning icons**: ⚠️ for values outside normal range
- **Checkboxes**: □ for incomplete, ☑ for completed

## Color Legend

Include at bottom of page:

| Color | Section | Hex |
|-------|---------|-----|
| Red | Hemodynamics | #c0392b |
| Blue | Respiratory | #2980b9 |
| Green | Neurological | #27ae60 |
| Yellow | I&O/Fluids | #f39c12 |
| Purple | Labs | #8e44ad |
| Gray | Notes | #95a5a6 |

## Print Considerations

### Page Breaks
- Each section should avoid breaking across pages
- Use `break-inside: avoid` in CSS

### Ink Usage
- Light backgrounds for readability
- Avoid heavy solid fills to conserve ink
- Grayscale printing friendly (colors convert to grayscale patterns)

### Margins
- 0.25" minimum for most printers
- No critical information in margin areas

## Digital Adaptation Notes

### Tablet Interface
- Touch-friendly larger tap targets
- Dropdowns for common values (e.g., GCS, pupil reaction)
- Auto-calculation of balances
- Integration with EMR for auto-population

### Smart Features
- Alerts for abnormal values
- Trend graphs on tap
- Voice-to-text for notes

## Customizability Guidelines

### Base Template (Non-negotiable)
- All critical parameters listed above
- Color coding system
- 24-hour grid structure

### Optional Sections
- Trauma scoring (ISS, GCS motor)
- Infection markers (WBC, CRP, procalcitonin)
- Specialty drips (insulin, heparin, vasopressin)
- ECMO parameters

### Unit-Specific Variations
- Cardiac ICU: Add cardiac output, Swan-Ganz parameters
- Neuro ICU: Add ICP, CPP, cerebral oxygenation
- Burn ICU: Add TBSA, wound care tracking

## Validation Criteria

### Usability Testing
- Nurses can locate any parameter within 3 seconds
- Hourly tracking easy without losing place
- Color coding intuitively understood
- Print legibility at 100% scale

### Efficiency Metrics
- Documentation time reduced by 20%
- Fewer missed assessments
- Reduced cognitive load (self-reported)

### Safety Metrics
- Error rate in transcription (compared to EMR)
- Early detection of deterioration (simulation)

---
**Specification Version**: 1.0
**Date**: 2026-03-16
**Based on**: ICU Sheet Analysis & Research Recommendations