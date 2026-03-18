#!/usr/bin/env python3
"""
Generate an enhanced nurse brain sheet PDF with improved layout.
"""

from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.colors import black, white, lightgrey
import datetime

def draw_patient_section(c, x, y, patient_num):
    """Draw one patient section at position (x, y)"""
    
    # Patient header with improved name space
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y, f"PATIENT {patient_num}:")
    c.setFont("Helvetica", 10)
    c.drawString(x + 60, y, "___________________________")
    c.drawString(x + 250, y, f"Room: ___")
    
    # Patient info block
    info_y = y - 20
    c.setFont("Helvetica", 8)
    c.drawString(x, info_y, "MRN: ___________ DOB: __/__/__ Age: ___")
    c.drawString(x, info_y - 15, "ALLERGIES: _________________________________________")
    c.drawString(x, info_y - 30, "CODE: □ Full □ DNR □ Other: _______")
    c.drawString(x + 180, info_y - 30, "ISOLATION: □ None □ Contact □ Droplet □ Airborne")
    c.drawString(x, info_y - 45, "FALL RISK: □ Low □ High (Score: ___)")
    c.drawString(x + 150, info_y - 45, "PAIN: 0-10: ___ Location: ________")
    c.drawString(x, info_y - 60, "DX: ________________________________________________")
    
    # Two-column layout
    col1_x = x
    col2_x = x + 200
    
    # Left column - Assessment
    assessment_y = info_y - 80
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col1_x, assessment_y, "VITALS")
    c.setFont("Helvetica", 8)
    
    # Vitals table
    vitals = ["TEMP", "BP", "HR", "RR", "SpO₂"]
    for i, vital in enumerate(vitals):
        c.drawString(col1_x, assessment_y - 20 - (i * 15), f"{vital}:")
        for j in range(6):
            c.drawString(col1_x + 40 + (j * 25), assessment_y - 20 - (i * 15), "___")
    
    # Labs
    labs_y = assessment_y - 120
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col1_x, labs_y, "LABS")
    c.setFont("Helvetica", 8)
    labs = ["Glucose", "K+", "Na+", "Creatinine", "Hgb", "WBC"]
    for i, lab in enumerate(labs):
        c.drawString(col1_x, labs_y - 20 - (i * 15), f"{lab}: ___")
    
    # Right column - Treatments
    treatments_y = assessment_y
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col2_x, treatments_y, "BLOOD SUGAR & INSULIN")
    c.setFont("Helvetica", 8)
    times = ["AC Breakfast", "AC Lunch", "AC Dinner", "HS"]
    for i, time in enumerate(times):
        c.drawString(col2_x, treatments_y - 20 - (i * 20), f"{time}: ___ Type: ___ Dose: ___")
    
    # Lines/Tubes
    lines_y = treatments_y - 100
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col2_x, lines_y, "LINES / TUBES / DRAINS")
    c.setFont("Helvetica", 8)
    c.drawString(col2_x, lines_y - 20, "IV: Site: _______ Rate: ___ mL/hr")
    c.drawString(col2_x, lines_y - 35, "Foley: □ Yes Output: ___ mL/shift")
    c.drawString(col2_x, lines_y - 50, "NG/GT: □ Yes Feeding: ________")
    
    # Body Systems
    systems_y = lines_y - 70
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col2_x, systems_y, "BODY SYSTEM ABNORMALITIES")
    c.setFont("Helvetica", 8)
    systems = ["CV:", "RESP:", "GI:", "GU:", "NEURO:", "SKIN:"]
    for i in range(0, 6, 2):
        c.drawString(col2_x, systems_y - 20 - (i//2 * 15), f"{systems[i]} ________")
        if i+1 < len(systems):
            c.drawString(col2_x + 100, systems_y - 20 - (i//2 * 15), f"{systems[i+1]} ________")
    
    # Medications grid
    meds_y = systems_y - 60
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col1_x, meds_y, "MEDICATIONS (24h)")
    c.setFont("Helvetica", 8)
    
    # Time headers
    times = ["0800", "1200", "1600", "2000", "0000", "0400"]
    for i, time in enumerate(times):
        c.drawString(col1_x + 40 + (i * 25), meds_y, time)
    
    # Medication rows
    for row in range(3):
        c.drawString(col1_x, meds_y - 20 - (row * 15), f"Med {row+1}:")
        for col in range(6):
            c.drawString(col1_x + 40 + (col * 25), meds_y - 20 - (row * 15), "[__]")
    
    # To-Do / Notes (LARGER AREA!)
    notes_y = meds_y - 80
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col1_x, notes_y, "TO-DO / NOTES")
    c.setFont("Helvetica", 8)
    
    # Draw note lines
    for i in range(4):
        c.line(col1_x, notes_y - 20 - (i * 15), col1_x + 350, notes_y - 20 - (i * 15))
    
    # Critical to communicate
    critical_y = notes_y - 90
    c.setFont("Helvetica-Bold", 9)
    c.drawString(col1_x, critical_y, "CRITICAL TO COMMUNICATE:")
    c.setFont("Helvetica", 8)
    c.drawString(col1_x + 10, critical_y - 20, "□ ________________________________________")
    c.drawString(col1_x + 10, critical_y - 35, "□ ________________________________________")
    
    # Signature lines
    sig_y = critical_y - 55
    c.drawString(col1_x, sig_y, "NURSE: ___________ TIME: ____")
    c.drawString(col1_x + 180, sig_y, "RELIEF NURSE: ___________ TIME: ____")
    
    return sig_y - 30

def main():
    # Create PDF
    c = canvas.Canvas("Enhanced_Nurse_Brain_Sheet.pdf", pagesize=landscape(letter))
    width, height = landscape(letter)
    
    # Header
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, height - 1*inch, "ENHANCED NURSE BRAIN SHEET")
    
    c.setFont("Helvetica", 10)
    today = datetime.datetime.now().strftime("%m/%d/%Y")
    c.drawString(1*inch, height - 1.3*inch, f"Unit: ___________ Date: {today} Shift: □ Day □ Night Nurse: _________")
    
    # Draw separator line
    c.line(0.5*inch, height - 1.5*inch, width - 0.5*inch, height - 1.5*inch)
    
    # Draw three patient sections
    start_y = height - 2*inch
    section_height = (height - 2.5*inch) / 3
    
    for i in range(3):
        y_pos = start_y - (i * section_height)
        # Draw patient section border
        c.rect(0.5*inch, y_pos - section_height + 0.2*inch, width - 1*inch, section_height - 0.2*inch)
        
        # Draw patient section content
        draw_patient_section(c, 0.7*inch, y_pos - 0.3*inch, i+1)
        
        # Draw separator between patients
        if i < 2:
            c.line(0.5*inch, y_pos - section_height + 0.1*inch, width - 0.5*inch, y_pos - section_height + 0.1*inch)
    
    # Footer with abbreviation key
    footer_y = 0.5*inch
    c.setFont("Helvetica", 7)
    c.drawString(0.5*inch, footer_y, "ABBREVIATIONS: A&O=Alert & Oriented, NKDA=No Known Drug Allergies, DNR=Do Not Resuscitate, ")
    c.drawString(0.5*inch, footer_y - 10, "I&O=Intake & Output, PRN=As Needed, AC=Before Meals, HS=At Bedtime, RA=Room Air")
    
    c.setFont("Helvetica", 6)
    c.drawString(width - 3*inch, footer_y, "Confidential - HIPAA Compliant | Enhanced Nurse Brain Sheet")
    c.drawString(width - 3*inch, footer_y - 8, f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    c.save()
    print("Enhanced nurse brain sheet PDF generated: Enhanced_Nurse_Brain_Sheet.pdf")

if __name__ == "__main__":
    main()