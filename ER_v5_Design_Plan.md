# ER v5 Patient Tracking Sheet Design Plan

## Executive Summary
A dual-format, portrait-oriented patient tracking sheet designed for Emergency Department workflow optimization. The system includes two complementary variants:

1. **Detailed High-Acuity Sheet** (4 patients) – For trauma, critical care, and complex cases requiring extensive documentation
2. **Fast-Track Summary Sheet** (8 patients) – For urgent care, low-acuity, and high-volume settings requiring rapid overview

Both variants feature structured flexibility with organized sections plus a "Rapid Changes" improvisation area, clear new-grad friendly labeling, and professional medical visual design optimized for portrait clipboard use.

---

## 1. Core Design Principles

### 1.1 Dual-Format Strategy
- **Detailed (4-patient):** Maximum information density for high-acuity patients
- **Summary (8-patient):** Essential fields only for fast-track throughput

### 1.2 Portrait Orientation Advantages
- **Clipboard compatibility** – Fits standard medical clipboards
- **Natural writing flow** – Top-to-bottom following patient assessment sequence
- **Paper standard** – US Letter (8.5×11") portrait orientation
- **One-handed use** – Easier to hold while standing or moving

### 1.3 Structured Flexibility
- **Organized sections** – Consistent grouping of related information
- **Rapid Changes area** – Dedicated space for evolving clinical situations
- **Modular design** – Sections can be used independently based on patient needs

### 1.4 New-Grad Friendly Features
- **Clear labels** – Plain language, no medical abbreviations without explanation
- **Examples** – Inline examples for complex fields
- **Glossary** – Quick-reference definitions on sheet footer
- **Color coding** – Subtle, intuitive color system for ESI levels

### 1.5 Critical Field Prioritization
Based on research analysis, these fields are essential for all ED patients:
1. Patient identification and demographics
2. ESI acuity level
3. Allergies and code status
4. Vital signs grid with trending
5. Medications and tasks
6. Clinical notes and SBAR handoff

---

## 2. Layout Specifications

### 2.1 Page Dimensions (Both Variants)
- **Orientation:** Portrait
- **Size:** US Letter (8.5″ × 11″)
- **Margins:** 0.5″ on all sides (safe printing zone)
- **Effective Area:** 7.5″ × 10″

### 2.2 Detailed Variant (4-Patient High-Acuity)

#### Grid Structure
- **2×2 matrix** – Four equal quadrants, each for one patient
- **Quadrant Size:** 3.5″ wide × 4.75″ tall (including internal margins)
- **Internal Gutter:** 0.25″ between quadrants

#### Section Organization (per quadrant)
1. **Patient Header** (Name, MRN, Age, Sex, Arrival Time)
2. **Acuity & Safety** (ESI, Allergies, Code Status, Isolation, Fall Risk)
3. **Vitals Grid** (8 time points, trending arrows)
4. **Medications & Tasks** (Checklist + timestamped administration)
5. **Clinical Notes** (SOAP format with problem list)
6. **Rapid Changes Area** (Ad-hoc documentation for evolving status)
7. **SBAR Handoff** (Structured transfer section)

#### Space Allocation
- **Fixed Sections:** 75% of quadrant (structured documentation)
- **Flexible Areas:** 25% of quadrant (Rapid Changes + free notes)
- **Writing Space:** Minimum 0.25″ line height for all fields

### 2.3 Summary Variant (8-Patient Fast-Track)

#### Grid Structure
- **4×2 matrix** – Eight smaller rectangles, two columns, four rows
- **Patient Cell Size:** 3.5″ wide × 2.25″ tall
- **Row Gutter:** 0.2″ between rows

#### Section Organization (per cell)
1. **Patient Header** (Name, ESI, Arrival Time)
2. **Critical Flags** (Allergies, Code Status – icon-based)
3. **Vitals Snapshot** (Last set only with trending indicator)
4. **Active Tasks** (3 most urgent tasks with checkboxes)
5. **Status Indicator** (Color-coded progress: Triage → Treat → Disposition)

#### Space Optimization
- **Icon-based flags** – Small, recognizable symbols
- **Abbreviated vitals** – Key metrics only (BP, HR, SpO₂)
- **Progressive disclosure** – Space for 1-2 line notes if needed
- **Quick-reference positioning** – Consistent cell location for each data type

---

## 3. Section-by-Section Field Specifications

### 3.1 Patient Header (Both Variants)
- **Detailed:** Name: ____________  MRN: ______  Age: __  Sex: M/F/Other  
  Arrival: __:__  ESI: □1 □2 □3 □4 □5
- **Summary:** Name: ________  ESI: ① ② ③ ④ ⑤  Arrival: __:__

### 3.2 Acuity & Safety Section (Detailed Only)
```
ALLERGIES: ____________________________________
CODE STATUS: □ Full Code  □ DNR/DNI  □ Other ______
ISOLATION: □ Contact  □ Droplet  □ Airborne  □ None
FALL RISK: □ Yes (Bed Alarm)  □ No
LANGUAGE: ________  INTERPRETER: □ Needed  □ Done
```

### 3.3 Vitals Grid Design

#### Detailed Variant (High-Frequency Tracking)
```
Time │ BP │ HR │ RR │ SpO₂ │ Temp │ Pain │ Neuro
─────┼────┼────┼────┼──────┼──────┼──────┼──────
     │    │    │    │      │      │      │
     │    │    │    │      │      │      │
     │    │    │    │      │      │      │
     │    │    │    │      │      │      │
Trend: ↗ → ↘  (circle one)
```

#### Summary Variant (Snapshot)
```
Last Vitals: BP ___/___  HR ___  SpO₂ ___%
Trend: ↗ → ↘  Pain: 0-10 ___
```

### 3.4 Medications & Tasks

#### Detailed Variant
```
ACTIVE MEDICATIONS:
□ [ ] Medication ____________ Dose ___ Route ___ Time ___
□ [ ] Medication ____________ Dose ___ Route ___ Time ___

URGENT TASKS:
□ Labs: □ CBC □ CMP □ Trop □ Lactate □ Other ______
□ Imaging: □ XR □ CT □ US □ MRI
□ Consults: □ Trauma □ Surgery □ Cardiology □ Other ______
□ Procedures: □ IV Access □ Foley □ NG Tube □ Central Line
```

#### Summary Variant (Icon-Based)
```
Tasks:  ⚕️  💉  📋  (circle completed)
Meds: □ Given  □ Due  □ Hold
```

### 3.5 Clinical Notes (Detailed Only)
```
PROBLEM LIST:
1. ________________________
2. ________________________
3. ________________________

ASSESSMENT & PLAN:
• _______________________________________
• _______________________________________
• _______________________________________
```

### 3.6 Rapid Changes Area (Both Variants)
```
═══════════════════════════════════════════════
RAPID CHANGES / EVOLVING STATUS
═══════════════════════════════════════════════
Time: __:__ Change: __________________________
Time: __:__ Change: __________________________
Time: __:__ Change: __________________________
═══════════════════════════════════════════════
```

### 3.7 SBAR Handoff (Detailed Only)
```
SBAR HANDOFF (Complete at transfer):
S: ___________________________________________
B: ___________________________________________
A: ___________________________________________
R: ___________________________________________
```

---

## 4. Visual Design Guidelines

### 4.1 Color Coding System

#### ESI Level Colors (Subtle Background Tints)
- **ESI 1 (Red):** #FFEBEE (Very light red) – Urgent section background
- **ESI 2 (Orange):** #FFF3E0 (Very light orange) – Section border
- **ESI 3 (Yellow):** #FFFDE7 (Very light yellow) – Header highlight
- **ESI 4 (Green):** #E8F5E9 (Very light green) – No highlight
- **ESI 5 (Blue):** #E3F2FD (Very light blue) – No highlight

#### Functional Color Coding
- **Critical Alerts:** #FFCDD2 (Light red) for allergies, code status
- **Medications:** #E1F5FE (Light cyan) for medication sections
- **Tasks:** #F3E5F5 (Light purple) for procedure/task areas
- **Notes:** #F1F8E9 (Light green) for clinical notes
- **Rapid Changes:** #FFF8E1 (Light amber) for improvisation area

### 4.2 Print Optimization
- **B&W Safe:** All colors at ≤15% saturation, distinguishable in grayscale
- **Border Hierarchy:** 
  - Patient boundary: 1.0 pt solid line
  - Section divider: 0.5 pt dashed line
  - Subsection: 0.25 pt dotted line
- **Font Sizes:**
  - Headers: 9 pt Bold
  - Labels: 8 pt Regular
  - Writing fields: 8 pt with 1.5× line spacing
  - Icons: 10 pt (symbol font)

### 4.3 Typography
- **Primary Font:** Arial/Helvetica (sans-serif for clarity)
- **Monospaced Option:** Consolas/Courier for vitals grids (optional)
- **Icon Font:** Material Icons or Wingdings for symbol-based summary

### 4.4 Spacing Standards
- **Cell Padding:** 2 mm minimum around all content
- **Line Height:** 1.2× for text, 1.5× for handwriting areas
- **Section Margins:** 3 mm between major sections
- **Checkbox Size:** 3 mm × 3 mm squares

---

## 5. Two-Variant Comparison Matrix

| Feature | Detailed (4-patient) | Summary (8-patient) |
|---------|----------------------|---------------------|
| **Patients per sheet** | 4 | 8 |
| **Primary use case** | High-acuity, trauma, ICU holds | Fast-track, urgent care, high-volume |
| **Vitals tracking** | Full grid (8+ time points) | Snapshot (last set only) |
| **Medication detail** | Full administration records | Status icons only |
| **Notes space** | SOAP format + problem list | 1-2 line abbreviated notes |
| **SBAR handoff** | Full structured section | Not included (separate form) |
| **Rapid Changes area** | Included in each quadrant | Shared at bottom of sheet |
| **Color coding** | Full ESI + functional tints | ESI only (subtle) |
| **Print consumption** | Higher (more ink for tints) | Lower (minimal color) |
| **Clipboard friendliness** | Good (larger writing areas) | Excellent (compact, lightweight) |

---

## 6. Implementation Specifications

### 6.1 Detailed Variant Mockup (Text-Based)

```
┌─────────────────────────────────────────────────────────┐
│ Patient 1: Name ___________ MRN _____ Age __ Sex M/F/O  │
│ Arrival: __:__ ESI: □1 □2 □3 □4 □5                     │
├─────────────────────────────────────────────────────────┤
│ ALLERGIES: ___________________________                  │
│ CODE: □ Full □ DNR/DNI □ Other _______                 │
│ ISOLATION: □ Contact □ Droplet □ Airborne □ None       │
│ FALL RISK: □ Yes □ No  LANG: ________                  │
├─────────────────────────────────────────────────────────┤
│ Time │ BP   │ HR │ RR │ SpO₂ │ Temp │ Pain │ Neuro     │
│ 08:00│_____ │___ │___ │___%  │___°C │___   │_________ │
│ 10:00│_____ │___ │___ │___%  │___°C │___   │_________ │
│ 12:00│_____ │___ │___ │___%  │___°C │___   │_________ │
│ 14:00│_____ │___ │___ │___%  │___°C │___   │_________ │
│ Trend: ↗ → ↘                                           │
├─────────────────────────────────────────────────────────┤
│ ACTIVE MEDS: □ [ ] _______________ Dose ___ Route ___  │
│             □ [ ] _______________ Dose ___ Route ___  │
│ URGENT TASKS: □ Labs □ Imaging □ Consults □ Procedures │
├─────────────────────────────────────────────────────────┤
│ PROBLEM LIST:                                          │
│ 1. ________________________                            │
│ 2. ________________________                            │
│ A&P: • _______________________________________        │
│      • _______________________________________        │
├─────────────────────────────────────────────────────────┤
│ RAPID CHANGES:                                         │
│ __:__ _______________________________________         │
│ __:__ _______________________________________         │
├─────────────────────────────────────────────────────────┤
│ SBAR: S: ____________________________________         │
│       B: ____________________________________         │
│       A: ____________________________________         │
│       R: ____________________________________         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Summary Variant Mockup (Text-Based)

```
┌──────────────────────┬──────────────────────┐
│ Name: ________      │ Name: ________      │
│ ESI: ① ② ③ ④ ⑤    │ ESI: ① ② ③ ④ ⑤    │
│ Arrival: __:__      │ Arrival: __:__      │
├──────────────────────┼──────────────────────┤
│ ⚠️ Allergy: NKDA    │ ⚠️ Allergy: Penicillin│
│ ⚕️ Code: Full       │ ⚕️ Code: DNR/DNI    │
├──────────────────────┼──────────────────────┤
│ BP: ___/___ HR: ___ │ BP: ___/___ HR: ___ │
│ SpO₂: ___% Pain: __ │ SpO₂: ___% Pain: __ │
│ Trend: ↗ → ↘       │ Trend: ↗ → ↘       │
├──────────────────────┼──────────────────────┤
│ Tasks: ⚕️ 💉 📋     │ Tasks: ⚕️ 📋 🩺     │
│ Meds: □ Given □ Due │ Meds: □ Given □ Due │
├──────────────────────┼──────────────────────┤
│ Status: Triage → Treat │ Status: Treat → Dispo │
└──────────────────────┴──────────────────────┘
(4 rows × 2 columns = 8 patients total)
```

### 6.3 New-Grad Friendly Features

#### Glossary (Footer Section)
```
ESI: Emergency Severity Index (1=Resuscitation, 2=Emergent, 3=Urgent, 4=Less Urgent, 5=Non‑Urgent)
NKDA: No Known Drug Allergies
DNR/DNI: Do Not Resuscitate/Do Not Intubate
SBAR: Situation-Background-Assessment-Recommendation
SOAP: Subjective-Objective-Assessment-Plan
```

#### Inline Examples
- **Allergies:** "e.g., Penicillin, NKDA"
- **Code Status:** "e.g., Full Code, DNR/DNI, MOLST"
- **Pain Scale:** "0=No pain, 10=Worst imaginable"
- **Trend Arrows:** "↑ = worsening, → = stable, ↓ = improving"

### 6.4 Print & Production Specifications

#### Paper Stock
- **Weight:** 70–80 lb text (heavy enough for writing, light enough for clipboard)
- **Finish:** Matte/satin (reduces glare under hospital lighting)
- **Perforations:** Optional tear-off line at bottom for rapid changes area

#### Ink Considerations
- **Primary:** Black (100% K) for all text and borders
- **Secondary:** CMYK tints at 10–15% saturation for color coding
- **Bleed:** None (standard letter size, no bleed needed)

#### Digital Version
- **PDF Format:** Fillable PDF with tab-indexed fields
- **Auto-calculation:** Automatic trending arrows based on vital sign inputs
- **Integration:** EHR-compatible data export (HL7/FHIR optional)

---

## 7. Next Steps & Recommendations

### 7.1 Pilot Testing
1. **Phase 1:** 2-week pilot in high-acuity zone (4-patient detailed variant)
2. **Phase 2:** 2-week pilot in fast-track zone (8-patient summary variant)
3. **Feedback Collection:** Structured surveys + focus groups with nurses, residents, and charge nurses

### 7.2 Iteration Cycle
- **Week 1–2:** Initial use, identify pain points
- **Week 3:** Design tweaks based on feedback
- **Week 4:** Revised sheets distributed
- **Month 2:** Final version locked, training materials created

### 7.3 Training Materials
- **Quick-start guide:** One-page visual reference
- **Video tutorial:** 5-minute walkthrough of both variants
- **FAQ sheet:** Common questions and best practices
- **Pre-printed sheets:** Initial stock order (500 copies each variant)

### 7.4 Long-term Evolution
- **Digital integration:** Tablet‑based version with sync to EHR
- **Customization portal:** Unit‑specific modifications (additional fields, local protocols)
- **Analytics:** Usage tracking to identify workflow bottlenecks

---

## 8. Conclusion

The ER v5 Patient Tracking Sheet system addresses the core needs identified in research analysis:
- **Dual‑format flexibility** for varying acuity levels
- **Portrait orientation** for clipboard usability
- **Structured yet adaptable** sections with dedicated rapid‑changes area
- **New‑grad friendly** design with clear labeling and glossary
- **Professional visual design** optimized for both print and digital use

By implementing both the 4‑patient detailed and 8‑patient summary variants, emergency departments can optimize documentation for both high‑acuity and high‑volume scenarios, reducing cognitive load and improving clinical efficiency.

**Final Deliverables:**
1. Print‑ready PDFs of both variants
2. Fillable digital versions
3. Training materials and quick‑start guide
4. Pilot implementation plan

This design plan provides a comprehensive foundation for immediate implementation and iterative improvement based on real‑world clinical feedback.