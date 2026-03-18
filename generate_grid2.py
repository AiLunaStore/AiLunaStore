#!/usr/bin/env python3

def create_grid():
    col_width = 50  # characters per column
    # Define patient fields (each must be <= col_width)
    fields = [
        "Pt: ________ MRN: ______ Rm: ___ ESI: □1 □2 □3 □4 □5",
        "CC: _______________________________________",
        "Allerg: ___________________________________",
        "Vitals: BP___/___ HR___ RR___ SpO₂___% T___°C",
        "Pending: __________________________________",
        "Meds Due: _________________________________",
        "Notes: ____________________________________"
    ]
    
    # Verify lengths
    for i, f in enumerate(fields):
        if len(f) > col_width:
            print(f"Field {i} too long: {len(f)} > {col_width}")
            return ""
    
    # Borders
    top = "┌" + "─" * col_width + "┬" + "─" * col_width + "┐"
    bottom = "└" + "─" * col_width + "┴" + "─" * col_width + "┘"
    middle = "├" + "─" * col_width + "┼" + "─" * col_width + "┤"
    
    lines = []
    # Header
    lines.append(" " * 20 + "ER NURSE BRAIN SHEET v2 - MINIMALIST (8 patients)")
    lines.append(" " * 25 + "Unit: ________  Date: ___/___/___  Shift: □D □N □E  Nurse: ______")
    lines.append("")
    lines.append(top)
    
    # 4 rows of patients
    for row in range(4):
        left_patient_num = row * 2 + 1
        right_patient_num = row * 2 + 2
        for field_idx, field in enumerate(fields):
            left_cell = field
            right_cell = field
            if field_idx == 0:
                # Add patient number prefix
                left_cell = f"P{left_patient_num}: " + field[3:]  # replace "Pt:" with "P1:"
                right_cell = f"P{right_patient_num}: " + field[3:]
            left_cell = left_cell.ljust(col_width)
            right_cell = right_cell.ljust(col_width)
            lines.append("│" + left_cell + "│" + right_cell + "│")
        if row < 3:
            lines.append(middle)
        else:
            lines.append(bottom)
    
    return "\n".join(lines)

if __name__ == "__main__":
    print(create_grid())