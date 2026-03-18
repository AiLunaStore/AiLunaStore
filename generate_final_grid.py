#!/usr/bin/env python3

def create_text_grid():
    col_width = 50
    fields = [
        'Pt:______ MRN:____ Rm:__ ESI:□1□2□3□4□5',
        'CC: _______________________________________',
        'Allerg: ___________________________________',
        'Vitals: BP___/___ HR___ RR___ SpO₂___% T___°C',
        'Pending: __________________________________',
        'Meds Due: _________________________________',
        'Notes: ____________________________________'
    ]
    
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
        left_num = row * 2 + 1
        right_num = row * 2 + 2
        for field_idx, field in enumerate(fields):
            left_cell = field
            right_cell = field
            if field_idx == 0:
                # Replace Pt with patient number
                left_cell = f'P{left_num}:______ MRN:____ Rm:__ ESI:□1□2□3□4□5'
                right_cell = f'P{right_num}:______ MRN:____ Rm:__ ESI:□1□2□3□4□5'
            # Pad to col_width
            left_cell = left_cell.ljust(col_width)
            right_cell = right_cell.ljust(col_width)
            lines.append("│" + left_cell + "│" + right_cell + "│")
        if row < 3:
            lines.append(middle)
        else:
            lines.append(bottom)
    
    # Add footer
    lines.append("")
    lines.append("Critical fields only. Landscape 11×8.5\". Larger fonts. Clean boundaries.")
    lines.append("Hybrid workflow: paper for quick notes, structured but flexible.")
    return "\n".join(lines)

def create_html_grid():
    # Simple HTML version (optional)
    html = """<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; margin: 0.5in; }
        .page { width: 10in; height: 7.5in; border: 1px solid #ccc; padding: 0.25in; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; grid-gap: 0.2in; }
        .patient { border: 1px solid #000; padding: 0.1in; }
        .field { margin-bottom: 0.05in; }
        label { font-weight: bold; }
        input[type="text"] { border: none; border-bottom: 1px solid #ccc; width: 100%; }
    </style>
</head>
<body>
    <div class="page">
        <h2>ER Nurse Brain Sheet v2 - Minimalist (8 patients)</h2>
        <div class="grid">
"""
    for i in range(1, 9):
        html += f"""
            <div class="patient">
                <div class="field"><label>Patient {i}:</label> <input type="text" placeholder="Name"></div>
                <div class="field"><label>MRN:</label> <input type="text" placeholder="MRN"></div>
                <div class="field"><label>Room:</label> <input type="text" placeholder="Room"></div>
                <div class="field"><label>ESI:</label> □1 □2 □3 □4 □5</div>
                <div class="field"><label>Chief Complaint:</label> <input type="text" placeholder=""></div>
                <div class="field"><label>Allergies:</label> <input type="text" placeholder=""></div>
                <div class="field"><label>Vitals:</label> BP<input type="text" size="3">/<input type="text" size="3"> HR<input type="text" size="3"> RR<input type="text" size="3"> SpO₂<input type="text" size="3">% T<input type="text" size="3">°C</div>
                <div class="field"><label>Pending Tasks/Labs:</label> <input type="text" placeholder=""></div>
                <div class="field"><label>Meds Due:</label> <input type="text" placeholder=""></div>
                <div class="field"><label>Notes:</label> <input type="text" placeholder=""></div>
            </div>
"""
    html += """
        </div>
    </div>
</body>
</html>"""
    return html

if __name__ == "__main__":
    text = create_text_grid()
    print(text)
    # Write to file
    with open("er_brain_sheet_v2_grid.txt", "w") as f:
        f.write(text)
    html = create_html_grid()
    with open("er_brain_sheet_v2_grid.html", "w") as f:
        f.write(html)
    print("\nFiles saved: er_brain_sheet_v2_grid.txt and er_brain_sheet_v2_grid.html")