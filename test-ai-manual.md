# Manual AI Suggestions Testing Guide

Since server-side PDF rendering has compatibility issues, please test via the web interface and use the scoring script.

## Steps:

1. **Start the server** (if not already running):
   ```bash
   npm start
   ```

2. **Open the app** in your browser: `http://localhost:3000`

3. **For each of the 5 PDFs**, do the following:
   - Click on the PDF in the file list (or use navigation arrows)
   - Wait for the PDF preview to load (you should see canvas elements)
   - Click "✨ Get AI Suggestions" button
   - Wait for suggestions to appear
   - Copy the suggestions (see format below)

4. **Score each result** using the scoring script:
   ```bash
   node score-suggestions.js "<original-filename>" "<suggested-filename>" "<title>" "<subject>" "<keywords>"
   ```

## PDFs to Test:

1. `02282023_United Healthcare.pdf`
2. `02282025_Store Hours.pdf`
3. `03012024 CarMax Offer Rogue.pdf`
4. `03012025_SPORTS+OUTDOORS.pdf`
5. `2022-02-28-northwestern-mutual-529-felix.pdf`

## Example Scoring Command:

```bash
node score-suggestions.js "2025-02-27 HEB Groceries.pdf" "2025-02-27 — Receipt — Grocery — HEB" "HEB Grocery Receipt" "HEB grocery receipt for household items" "receipt,grocery,retail,heb,katherine-b-harris,keep-annual,year-2025,month-02"
```

## Recording Results:

After scoring all 5 PDFs, you'll have:
- Individual scores for each PDF
- Average score across all tests
- Identified patterns/issues to improve the prompt
