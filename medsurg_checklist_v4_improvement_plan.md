# MedSurg Checklist v4 Improvement Plan

## Current Analysis

The current `medsurg_checklist_v4_proper.html` is a 3-patient landscape checklist with the following sections per patient:
- Room header
- Human outline (simple front/back SVG)
- Mental Status
- IV Fluids
- Mobility
- Pain Scale
- Common Medications
- Assessments & Interventions
- Notes

**Strengths:**
- Clean color-coded sections
- Compact layout for 3 patients
- Interactive slash-options
- Pain scale visualization

**Areas for Improvement (per task brief):**

### 1. Human Outline Enhancement
- **Current:** Basic stick-figure SVG with front/back
- **Goal:** Replace with professional front/back anatomical image (user to provide)
- **Add medical symbol key:** IV, Foley, wound, drain markers for annotation
- **Optimize space:** Reduce vertical height, integrate symbol legend inline

### 2. Section Optimization
- **IV Fluids:** Currently 5 lines (Type, Rate, Site, Gauge, Status) with many options
- **Simplify:** Combine Type/Rate, reduce site options to most common, move gauge to inline
- **Prioritize:** Keep LR, NS, D5W, None for Type; keep KVO, 100, 125, 150 for Rate
- **Compact layout:** Use two-line layout with slash-options

### 3. Missing Critical Features
- **Medication timing checkboxes:** 0800, 1200, 1600, 2000, 0000 (common nursing shifts)
- **Wound care tracking:** Location, type (pressure, surgical, etc.), dressing (gauze, foam, vac)
- **SBAR handoff section:** Situation, Background, Assessment, Recommendation (compact)
- **Acuity color coding:** Green (stable), Yellow (monitor), Red (critical) indicators per patient

### 4. Usability Improvements
- **Critical alerts area:** Highlighted box for allergies, fall risk, isolation precautions
- **Shift handoff signature line:** Nurse name, time, report given/received
- **QR code:** Link to digital companion app/notes (generated dynamically)
- **Print layout improvement:** Better spacing for 3 patients, reduce margins, ensure no overflow

## Proposed Layout Mockup

### Overall Structure (per patient column)
```
[Room: _____] [Acuity: ● Green ● Yellow ● Red]

[Human Outline Area - Front/Back image with clickable symbol key]
[Symbol Key: IV ● Foley ● Wound ● Drain ● Other]

[Critical Alerts] [Allergies: _________] [Fall Risk: Y/N] [Isolation: _________]

[Mental Status] [IV Fluids (simplified)] 
[Mobility]      [Pain Scale]

[Common Medications] [Med Timing: □0800 □1200 □1600 □2000 □0000]

[Wound Care] Location: _________ Type: _________ Dressing: _________

[Assessments & Interventions] [SBAR Handoff]

[Notes] [Shift Signature: _________________]

[QR code - small bottom right]
```

### Section-by-Section Changes

#### 1. Human Outline Area
- Replace `<svg>` with `<div class="human-outline-img">` containing two images (front/back)
- Add `.symbol-key` below images with small icons and labels
- Reduce height from current ~0.85in to ~0.7in
- Add click/tap annotation capability (future enhancement)

#### 2. IV Fluids Simplification
**Current:**
- Type: LR/NS/D5W/D5NS/RL/None
- Rate: KVO/50/75/100/125/150 + ___ mL/hr
- Site: L AC/R AC/L FA/R FA/L Hand/R Hand/Central/PIV
- Gauge: ___
- Status: Patent/Infiltrated/DC'd

**Proposed:**
- **Line 1:** Type: LR/NS/D5W/None | Rate: KVO/100/125/150 + ___ mL/hr
- **Line 2:** Site: L AC/R AC/Hand/Central | Gauge: ___ | Status: ✓/✗/DC

#### 3. New Sections

**Medication Timing:**
- Add checkboxes for common medication administration times
- Position below Common Medications section
- Format: `Meds Given: □0800 □1200 □1600 □2000 □0000`

**Wound Care Tracking:**
- New section after Medications
- Three inline inputs: Location, Type, Dressing
- Type options: Pressure/Surgical/Traumatic/Other
- Dressing options: Gauze/Foam/Vac/Other

**SBAR Handoff:**
- Compact version within Assessments section
- Four small text areas or bullet points
- Could be expandable/collapsible to save space

**Acuity Color Coding:**
- Three colored dots next to room header
- Click to select acuity level
- Visual indicator for quick triage

**Critical Alerts:**
- Highlighted yellow/red background area at top
- Fields: Allergies, Fall Risk (Y/N), Isolation (Contact/Droplet/Airborne)
- Persists across all patients (maybe shared at sheet level?)

**Shift Handoff Signature:**
- Line at bottom of each patient column: "Report to: ________ Time: ___"
- Small but important for accountability

**QR Code:**
- Generate QR linking to digital version or patient-specific notes
- Place in bottom corner, size ~0.5in square

### CSS/HTML Implementation Plan

#### A. Structural Changes
1. Add acuity indicator in room header:
   ```html
   <div class="room-header">
     Room: <input type="text">
     <div class="acuity-dots">
       <span class="dot green" title="Stable"></span>
       <span class="dot yellow" title="Monitor"></span>
       <span class="dot red" title="Critical"></span>
     </div>
   </div>
   ```

2. Replace human-outline div with:
   ```html
   <div class="human-outline-enhanced">
     <div class="outline-images">
       <img src="front.png" alt="Front outline">
       <img src="back.png" alt="Back outline">
     </div>
     <div class="symbol-key">
       <span class="symbol" data-type="iv">💉 IV</span>
       <span class="symbol" data-type="foley">🚽 Foley</span>
       <span class="symbol" data-type="wound">🩹 Wound</span>
       <span class="symbol" data-type="drain">💧 Drain</span>
     </div>
   </div>
   ```

3. Add critical alerts section (shared across patients or per patient?):
   ```html
   <div class="section-alerts">
     <h4>⚠️ Critical Alerts</h4>
     <div class="alerts-fields">
       <span>Allergies: <input type="text" class="wide"></span>
       <span>Fall Risk: <span class="slash-options"><span>Y</span>/<span>N</span></span></span>
       <span>Isolation: <input type="text" class="narrow"></span>
     </div>
   </div>
   ```

4. Modify IV Fluids section with compact layout:
   ```html
   <div class="section section-iv">
     <h4>IV Fluids</h4>
     <div class="checklist compact">
       <span class="check-item">Type: <span class="slash-options"><span>LR</span>/<span>NS</span>/<span>D5W</span>/<span>None</span></span></span>
       <span class="check-item">Rate: <span class="slash-options"><span>KVO</span>/<span>100</span>/<span>125</span>/<span>150</span></span> <input type="text" class="narrow"> mL/hr</span>
       <span class="check-item">Site: <span class="slash-options"><span>L AC</span>/<span>R AC</span>/<span>Hand</span>/<span>Central</span></span> Gauge: <input type="text" class="tiny"></span>
       <span class="check-item">Status: <span class="slash-options"><span>✓ Patent</span>/<span>✗ Infiltrated</span>/<span>DC'd</span></span></span>
     </div>
   </div>
   ```

5. Add medication timing:
   ```html
   <div class="section section-meds-timing">
     <h4>Med Timing</h4>
     <div class="checklist">
       <span class="check-item">Given: 
         <label><input type="checkbox"> 0800</label>
         <label><input type="checkbox"> 1200</label>
         <label><input type="checkbox"> 1600</label>
         <label><input type="checkbox"> 2000</label>
         <label><input type="checkbox"> 0000</label>
       </span>
     </div>
   </div>
   ```

6. Add wound care section:
   ```html
   <div class="section section-wound">
     <h4>Wound Care</h4>
     <div class="checklist">
       <span class="check-item">Location: <input type="text" class="wide"></span>
       <span class="check-item">Type: <span class="slash-options"><span>Pressure</span>/<span>Surgical</span>/<span>Traumatic</span>/<span>Other</span></span></span>
       <span class="check-item">Dressing: <span class="slash-options"><span>Gauze</span>/<span>Foam</span>/<span>Vac</span>/<span>Other</span></span> Change: <input type="text" class="tiny">h</span>
     </div>
   </div>
   ```

7. Add SBAR to Assessments section:
   ```html
   <div class="sbar-toggle">SBAR ▼</div>
   <div class="sbar-fields" style="display: none;">
     <div>S: <input type="text" placeholder="Situation"></div>
     <div>B: <input type="text" placeholder="Background"></div>
     <div>A: <input type="text" placeholder="Assessment"></div>
     <div>R: <input type="text" placeholder="Recommendation"></div>
   </div>
   ```

8. Add signature line at bottom:
   ```html
   <div class="signature-line">
     Report to: <input type="text" class="signature"> Time: <input type="text" class="time">
   </div>
   ```

9. Add QR code container:
   ```html
   <div class="qr-container">
     <div class="qr-placeholder">QR code</div>
     <div class="qr-label">Scan for digital</div>
   </div>
   ```

#### B. CSS Adjustments for Space Optimization
- Reduce vertical padding in sections from 3px 4px to 2px 3px
- Reduce font-size from 7pt to 6.5pt for checklist items
- Use tighter line-height (1.1)
- Reduce gap between patient columns from 0.2in to 0.15in
- Consider two-column layout within each patient for certain sections (e.g., Mental + IV on same row)
- Implement flexbox grid for compact arrangement

#### C. Print Layout Improvements
- Ensure @page margins are minimal (0.25in already good)
- Use `page-break-inside: avoid` for patient columns
- Test print preview with 3 patients
- Ensure QR code prints clearly (high contrast)

## Mockup Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Room: 301 ●○○              [Critical Alerts: Allergies: PCN, Fall: Y]   │
├─────────────────────────────────────────────────────────────────────────┤
│  [Front Image]  [Back Image]    Symbol Key: 💉 IV   🚽 Foley  🩹 Wound │
│                                                                         │
│ Mental: A&O 4 Alert          IV: LR @100mL/hr, L AC 20g ✓              │
│ Mobility: Ambulate 1 Assist  Pain: 3/10 Location: Abdomen Medicated    │
│                                                                         │
│ Meds: Acetaminophen, Heparin    Timing: ☑0800 ☑1200 □1600 □2000 □0000  │
│ Wound: Location: Sacrum Type: Pressure Dressing: Foam q4h              │
│                                                                         │
│ Assess: Neuro q4h, O2 NC 2L, Diet Full, Foley                        │
│ SBAR: S: Pain controlled, B: Post-op day 2, A: Afebrile, R: Cont meds  │
│                                                                         │
│ Notes: _____________________________________________________________   │
│                                                                         │
│ Signature: Nurse RN _______ Time: 1500          [QR code]              │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation Priority

1. **High Impact, Low Complexity:**
   - Acuity color coding
   - Medication timing checkboxes
   - Critical alerts section
   - Signature line
   - Section simplification (IV Fluids)

2. **Medium Complexity:**
   - Wound care tracking
   - SBAR handoff (collapsible)
   - Space optimization CSS

3. **Requires External Assets:**
   - Professional human outline images (user-provided)
   - QR code generation (backend or JavaScript)
   - Symbol key integration

## Next Steps

1. Create updated HTML file with proposed changes
2. Test print layout with 3 patients
3. Integrate user-provided images when available
4. Add JavaScript for interactive features (acuity selection, symbol annotation)
5. Generate QR code dynamically (could use Google Charts API)

## Deliverables

1. This improvement plan document
2. Updated `medsurg_checklist_v5.html` with mockup implementation
3. Optional: Separate CSS file for easier customization
4. Print test results

**Note:** The user will provide professional front/back images. Placeholder images can be used initially.

Let me know if you'd like me to proceed with implementing the HTML/CSS changes based on this plan.