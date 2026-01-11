# AI Suggestions Testing Results

## Testing Setup

Due to server-side PDF rendering compatibility issues, testing should be done via the web interface.

## Tools Created

1. **`score-suggestions.js`** - Automated scoring script based on the rubric
2. **`test-ai-manual.md`** - Manual testing instructions
3. **`test-ai-batch-browser.js`** - Browser automation (has compatibility issues)

## How to Test

### Option 1: Manual Testing (Recommended)

1. Start server: `npm start`
2. Open `http://localhost:3000`
3. For each PDF:
   - Open the PDF in the viewer
   - Wait for preview to load
   - Click "Get AI Suggestions"
   - Copy the 4 values (filename, title, subject, keywords)
   - Run the scoring script

### Option 2: Use Scoring Script

After getting suggestions from the web interface, score them:

```bash
node score-suggestions.js "<original-filename>" "<suggested-filename>" "<title>" "<subject>" "<keywords>"
```

## PDFs to Test

1. `02282023_United Healthcare.pdf`
2. `02282025_Store Hours.pdf`
3. `03012024 CarMax Offer Rogue.pdf`
4. `03012025_SPORTS+OUTDOORS.pdf`
5. `2022-02-28-northwestern-mutual-529-felix.pdf`

## Recording Results

After testing all 5 PDFs, record results here:

### Test 1: 02282023_United Healthcare.pdf
- Filename: 
- Title: 
- Subject: 
- Keywords: 
- Score: ___/40 (___%)

### Test 2: 02282025_Store Hours.pdf
- Filename: 
- Title: 
- Subject: 
- Keywords: 
- Score: ___/40 (___%)

### Test 3: 03012024 CarMax Offer Rogue.pdf
- Filename: 
- Title: 
- Subject: 
- Keywords: 
- Score: ___/40 (___%)

### Test 4: 03012025_SPORTS+OUTDOORS.pdf
- Filename: 
- Title: 
- Subject: 
- Keywords: 
- Score: ___/40 (___%)

### Test 5: 2022-02-28-northwestern-mutual-529-felix.pdf
- Filename: 
- Title: 
- Subject: 
- Keywords: 
- Score: ___/40 (___%)

## Summary

- Average Score: ___/40 (___%)
- Common Issues:
  - 
  - 
  - 

## Next Steps

Based on results, iterate on the prompt in `docs/ai-prompt-template.md`
