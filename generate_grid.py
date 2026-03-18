#!/usr/bin/env python3

def create_grid():
    # Define column widths
    col_width = 50  # characters per column
    # Define patient fields
    fields = [
        "Patient: ________________________  MRN: ________  Room: ______  ESI: □1 □2 □3 □4 □5",
        "Chief Complaint: ________________________________________________________",
        "Allergies: ______________________________________________________________",
        "Vitals: BP ___/___  HR ___  RR ___  SpO₂ ___%  Temp ___°C",
        "Pending: _______________________________________________________________",
        "Meds Due: ______________________________________________________________",
        "Notes: _________________________________________________________________"
    ]
    
    # Horizontal line for column separation
    hline = "─" * (col_width * 2 + 1)  # +1 for the middle border
    
    # Top border
    top = "┌" + "─" * col_width + "┬" + "─" * col_width + "┐"
    bottom = "└" + "─" * col_width + "┴" + "─" * col_width + "┘"
    middle = "├" + "─" * col_width + "┼" + "─" * col_width + "┤"
    
    # Build grid
    lines = []
    lines.append(" " * 20 + "ER NURSE BRAIN SHEET v2 - MINIMALIST (8 patients)")
    lines.append(" " * 25 + "Unit: ________  Date: ___/___/___  Shift: □D □N □E  Nurse: ______")
    lines.append("")
    lines.append(top)
    
    # We'll have 4 rows of patients (each row contains two columns)
    for row in range(4):
        # For each field line, we need to create left and right cell content
        for field_idx, field in enumerate(fields):
            left_cell = field.ljust(col_width)
            right_cell = field.ljust(col_width)
            if row == 0 and field_idx == 0:
                # Add patient number
                left_cell = f"PATIENT {row*2 + 1}".ljust(10) + field[10:].ljust(col_width-10)
                right_cell = f"PATIENT {row*2 + 2}".ljust(10) + field[10:].ljust(col_width-10)
            line = "│" + left_cell + "│" + right_cell + "│"
            lines.append(line)
        if row < 3:
            lines.append(middle)
        else:
            lines.append(bottom)
    
    return "\n".join(lines)

if __name__ == "__main__":
    print(create_grid())