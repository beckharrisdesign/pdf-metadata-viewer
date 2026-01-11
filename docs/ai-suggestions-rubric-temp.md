### 7. Overall Accuracy (0-5 points)
- **5**: All suggestions accurately reflect document content AND are consistent with each other (filename, title, subject, and keywords all describe the same document coherently)
- **4**: Mostly accurate and consistent, minor discrepancies between fields
- **3**: Generally accurate but some inconsistencies between fields (e.g., filename mentions one vendor but keywords mention different vendor)
- **2**: Several inaccuracies or major inconsistencies (fields contradict each other)
- **1**: Mostly inaccurate or fields don't align with each other
- **0**: Completely wrong or completely inconsistent

**Consistency Check:**
- Filename, title, subject, and keywords should all describe the same document
- Vendor names should match across fields (e.g., if filename says "HEB", keywords should include "heb")
- Document type should be consistent (e.g., if filename says "Receipt", keywords should include "receipt")
- Person names should match if mentioned in multiple fields
- Subject summary should align with keywords and title

**Example Good (Consistent):**
- Filename: `2025-02-27 — Receipt — Grocery — HEB.pdf`
- Title: "HEB Grocery Receipt"
- Subject: "HEB grocery receipt for household items"
- Keywords: `receipt,grocery,retail,heb,katherine-b-harris,keep-annual,year-2025,month-02`
All fields consistently describe an HEB grocery receipt.

**Example Bad (Inconsistent):**
- Filename: `2025-02-27 — Receipt — Grocery — HEB.pdf`
- Title: "ARC Medical Bill"
- Subject: "Medical bill from Austin Regional Clinic"
- Keywords: `bill,medical,arc,felix-b-pierce,needs-payment`
Filename says HEB receipt, but everything else says ARC medical bill - completely inconsistent.
