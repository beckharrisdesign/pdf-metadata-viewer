# Testing AI Suggestions via Web Interface

Since server-side PDF rendering has compatibility issues, please test via the web interface:

## Steps:

1. Start the server: `npm start`
2. Open `http://localhost:3000` in your browser
3. For each of the 5 PDFs below, do the following:
   - Open the PDF in the viewer
   - Wait for preview to load
   - Click "Get AI Suggestions"
   - Copy the suggestions
   - Score using the rubric

## PDFs to Test:

1. `02282023_United Healthcare.pdf`
2. `02282025_Store Hours.pdf`
3. `03012024 CarMax Offer Rogue.pdf`
4. `03012025_SPORTS+OUTDOORS.pdf`
5. `2022-02-28-northwestern-mutual-529-felix.pdf`

## Recording Results:

Use the template from `docs/ai-suggestions-rubric.md` to record scores for each test.
