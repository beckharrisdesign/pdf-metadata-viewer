# Keyword Verification Results - Complete Analysis

## Summary

**Test Date:** January 2025  
**Files Analyzed:** All PDF files in PDFS_DIR  
**Status:** ✅ Keywords ARE being saved to PDF files, but are read back in corrupted format

### Key Findings

- **Total files analyzed:** 26 PDF files
- **Average keywords per file:** 7.08
- **Total keywords across all files:** 184
- **Most used keywords:**
  1. `financial` - 42.3% of files (11 files)
  2. `location-austin` - 34.6% of files (9 files)
  3. `john-n-pierce` - 26.9% of files (7 files)
  4. `tax-form` - 26.9% of files (7 files)
  5. `location-TX` - 26.9% of files (7 files)
  6. `katherine-b-harris` - 23.1% of files (6 files)
  7. `keep-7yr` - 23.1% of files (6 files)

### Critical Issue

Keywords are being **saved correctly** to PDF files, but `pdf-lib`'s `getKeywords()` method returns them in a corrupted format where each character is space-separated. The reconstruction algorithm successfully recovers the original keywords by:
1. Splitting on multiple spaces (which indicate keyword boundaries)
2. Removing single spaces within each keyword
3. Preserving intact test keywords

---

📊 PDF Keyword Analysis

📁 Scanning directory: /Users/katybharris/Library/CloudStorage/GoogleDrive-katy@teamkatynick.com/My Drive/To Be Filed — PDF Metadata Viewer Test

Found 26 PDF file(s)

================================================================================


📄 2015-12-12 — Registration — Rogue — MassDOT — katherine-b-harris.pdf
   Keywords (6): location-ma, vehicle-registration, vehicle-rogue, location-watertown, katherine-b-harris, expired

📄 2017-12-21— Inspection Report — Rogue — Katherine.pdf
   Keywords (6): vehicle, vehicle-rogue, location-ma, vehicle-inspection-report, expired, not-duplicate

📄 2019-08-25 — Receipt — Donation — John Pierce.pdf
   Keywords (11): receipt, financial, donation, tax-deductible, keep-7yr, receipt-donation, john-n-pierce, year-2019, org-bikes-not-bombs, location-ma, location-watertown

📄 2020-03-14—Invoice—Firestone Complete Auto Care—John Pierce.pdf
   Keywords (9): invoice, vehicle, paid, location-tx, john-n-pierce, vehicle-yaris, location-austin, vendor-firestone-complete-auto-care, vehicle-maintenance

📄 2021-10-26 — Report — Teacher Conference — felix-pierce.pdf
   Keywords (4): school, assessment, school-bluebonnet, felix-b-pierce

📄 2022-02-01 — 1095-C — Taxes — Proof of Coverage — Katherine.pdf
   Keywords (11): tax-form, insurance, financial, keep-7yr, active, work-numo-llc, taxes-1095-c, katherine-b-harris, location-austin, proof-of-coverage, medical

📄 2022-02-01 — 1099-R — Upstart — john-n-pierce.pdf
   Keywords (11): tax-form, financial, keep-7yr, taxes-1099-r, taxes-keep-7yr, work-insperity, location-austin, location-TX, taxes-2022, work-upstart, john-n-pierce

📄 2022-02-01 — W-2 — Taxes — Upstart — john-n-pierce.pdf
   Keywords (10): tax-form, tax, financial, john-n-pierce, needs-filing, taxes-2022, taxes-w-2, work-upstart, location-austin, location-TX

📄 2022-02-01 — W-2 — Taxes — katherine-b-harris.pdf
   Keywords (9): financial, katherine-b-harris, keep-7yr, taxes-2022, work-pnc-bank, location-austin, location-TX, taxes-w-2, taxes-save7yr

📄 2022-02-01— 1095-C —Tax Form —john-n-pierce.pdf
   Keywords (5): tax-form, financial, year-2022, taxes-1095, proof-of-coverage

📄 2022-11-08 — form — Change in Transportation Arrangements — alexandra-pierce.pdf
   Keywords (3): form, school, alexandra-pierce

📄 2022-11-09 — Art Project — Canyon Creek — Alexandra.pdf
   Keywords (7): alexandra-f-pierce, school-canyon-creek, teacher-barnard, grade-first, year-2022, artwork, schoolwork

📄 2022-11-09 — Art — Alexandra.pdf
   Keywords (7): art, abstract, painting, alexandra-f-pierce, artwork, schoolwork, year-2022

📄 2022-11-09 — Artwork — Canyon Creek — Alexandra.pdf
   Keywords (2): form, art

📄 2022-11-09 — Schoolwork — Alexandra — Clouds.pdf
   Keywords (8): school, assessment, alexandra-f-pierce, school-canyon-creek, schoolwork, clouds, science, year-2022

📄 2022-11-09 — Schoolwork — Canyon Creek — alexandra-f-pierce.pdf
   Keywords (6): form, school, assessment, alexandra-f-pierce, school-canyon-creek, year-2022

📄 2023-01-01 — W-2 — Taxes — PNC Bank — Katherine Harris.pdf
   Keywords (10): financial, katherine-b-harris, keep-7yr, taxes-w-2, taxes-2023, taxes-keep-7yr, location-austin, location-TX, work-pnc-bank, work-numo-llc

📄 2023-01-01 — W-2 — Taxes — RSA Security — katherine-b-harris.pdf
   Keywords (12): tax-form, financial, keep-7yr, taxes-2023, katherine-b-harris, taxes-w-2, location-austin, location-TX, work-rsa-security, work-archer-irm, work-numo-llc, taxes-keep-7yr

📄 2023-01-01 — W-2 — Taxes — katherine-b-harris.pdf
   Keywords (10): tax-form, tax, financial, katherine-b-harris, taxes-W2, work-cisco-systems, taxes-2023, taxes-save7yr, location-austin, location-TX

📄 2023-01-03 — Statement— PNC ISP — katherine-harris.pdf
   Keywords (7): statement, financial, katherine-harris, no-split-needed, pnc-bank-isp, vendor-pnc-bank, financial-retirement

📄 2023-02-01 — 1099-R — Tax — Upstart —john-n-pierce.pdf
   Keywords (9): tax-form, tax, financial, john-n-pierce, work-upstart, location-austin, location-TX, taxes-1099-r, taxes-2023

📄 2023-10-01 — Business Card — Perez Tree Service — Jose Perez.pdf
   Keywords (3): home, perez-tree-service, business-card

📄 2023-10-09 — Insurance Card — Guardian VSP — john-n-pierce.pdf
   Keywords (6): insurance-card, medical, guardian, john-n-pierce, expired, vision

📄 2023-10-19 — Receipt — Grocery — HEB.pdf
   Keywords (4): receipt, grocery, heb, paid

📄 2025-07-20—receipt—Grocery—HEB.pdf
   Keywords (4): receipt, grocery, heb, john-n-pierce

📄 2025-09-30 — Receipt — Grocery — HEB.pdf
   Keywords (4): receipt, grocery, heb, paid

================================================================================

📊 STATISTICS

Average keywords per file: 7.08
Total keywords across all files: 184
Unique keywords: 81

🔝 Most Used Keywords:
    1. financial                      (11 files, 42.3%)
    2. location-austin                (9 files, 34.6%)
    3. john-n-pierce                  (7 files, 26.9%)
    4. tax-form                       (7 files, 26.9%)
    5. location-TX                    (7 files, 26.9%)
    6. katherine-b-harris             (6 files, 23.1%)
    7. keep-7yr                       (6 files, 23.1%)
    8. year-2022                      (5 files, 19.2%)
    9. receipt                        (4 files, 15.4%)
   10. school                         (4 files, 15.4%)
   11. taxes-w-2                      (4 files, 15.4%)
   12. alexandra-f-pierce             (4 files, 15.4%)
   13. taxes-2023                     (4 files, 15.4%)
   14. location-ma                    (3 files, 11.5%)
   15. expired                        (3 files, 11.5%)
   16. paid                           (3 files, 11.5%)
   17. assessment                     (3 files, 11.5%)
   18. work-numo-llc                  (3 files, 11.5%)
   19. taxes-keep-7yr                 (3 files, 11.5%)
   20. taxes-2022                     (3 files, 11.5%)

📈 Keyword Count Distribution:
    2 keywords: █ (1 file)
    3 keywords: ██ (2 files)
    4 keywords: ████ (4 files)
    5 keywords: █ (1 file)
    6 keywords: ████ (4 files)
    7 keywords: ███ (3 files)
    8 keywords: █ (1 file)
    9 keywords: ███ (3 files)
   10 keywords: ███ (3 files)
   11 keywords: ███ (3 files)
   12 keywords: █ (1 file)

📋 All Unique Keywords (alphabetical):
     1. abstract                                 (1 file, 3.8%)
     2. active                                   (1 file, 3.8%)
     3. alexandra-f-pierce                       (4 files, 15.4%)
     4. alexandra-pierce                         (1 file, 3.8%)
     5. art                                      (2 files, 7.7%)
     6. artwork                                  (2 files, 7.7%)
     7. assessment                               (3 files, 11.5%)
     8. business-card                            (1 file, 3.8%)
     9. clouds                                   (1 file, 3.8%)
    10. donation                                 (1 file, 3.8%)
    11. expired                                  (3 files, 11.5%)
    12. felix-b-pierce                           (1 file, 3.8%)
    13. financial                                (11 files, 42.3%)
    14. financial-retirement                     (1 file, 3.8%)
    15. form                                     (3 files, 11.5%)
    16. grade-first                              (1 file, 3.8%)
    17. grocery                                  (3 files, 11.5%)
    18. guardian                                 (1 file, 3.8%)
    19. heb                                      (3 files, 11.5%)
    20. home                                     (1 file, 3.8%)
    21. insurance                                (1 file, 3.8%)
    22. insurance-card                           (1 file, 3.8%)
    23. invoice                                  (1 file, 3.8%)
    24. john-n-pierce                            (7 files, 26.9%)
    25. katherine-b-harris                       (6 files, 23.1%)
    26. katherine-harris                         (1 file, 3.8%)
    27. keep-7yr                                 (6 files, 23.1%)
    28. location-TX                              (7 files, 26.9%)
    29. location-austin                          (9 files, 34.6%)
    30. location-ma                              (3 files, 11.5%)
    31. location-tx                              (1 file, 3.8%)
    32. location-watertown                       (2 files, 7.7%)
    33. medical                                  (2 files, 7.7%)
    34. needs-filing                             (1 file, 3.8%)
    35. no-split-needed                          (1 file, 3.8%)
    36. not-duplicate                            (1 file, 3.8%)
    37. org-bikes-not-bombs                      (1 file, 3.8%)
    38. paid                                     (3 files, 11.5%)
    39. painting                                 (1 file, 3.8%)
    40. perez-tree-service                       (1 file, 3.8%)
    41. pnc-bank-isp                             (1 file, 3.8%)
    42. proof-of-coverage                        (2 files, 7.7%)
    43. receipt                                  (4 files, 15.4%)
    44. receipt-donation                         (1 file, 3.8%)
    45. school                                   (4 files, 15.4%)
    46. school-bluebonnet                        (1 file, 3.8%)
    47. school-canyon-creek                      (3 files, 11.5%)
    48. schoolwork                               (3 files, 11.5%)
    49. science                                  (1 file, 3.8%)
    50. statement                                (1 file, 3.8%)
    51. tax                                      (3 files, 11.5%)
    52. tax-deductible                           (1 file, 3.8%)
    53. tax-form                                 (7 files, 26.9%)
    54. taxes-1095                               (1 file, 3.8%)
    55. taxes-1095-c                             (1 file, 3.8%)
    56. taxes-1099-r                             (2 files, 7.7%)
    57. taxes-2022                               (3 files, 11.5%)
    58. taxes-2023                               (4 files, 15.4%)
    59. taxes-W2                                 (1 file, 3.8%)
    60. taxes-keep-7yr                           (3 files, 11.5%)
    61. taxes-save7yr                            (2 files, 7.7%)
    62. taxes-w-2                                (4 files, 15.4%)
    63. teacher-barnard                          (1 file, 3.8%)
    64. vehicle                                  (2 files, 7.7%)
    65. vehicle-inspection-report                (1 file, 3.8%)
    66. vehicle-maintenance                      (1 file, 3.8%)
    67. vehicle-registration                     (1 file, 3.8%)
    68. vehicle-rogue                            (2 files, 7.7%)
    69. vehicle-yaris                            (1 file, 3.8%)
    70. vendor-firestone-complete-auto-care      (1 file, 3.8%)
    71. vendor-pnc-bank                          (1 file, 3.8%)
    72. vision                                   (1 file, 3.8%)
    73. work-archer-irm                          (1 file, 3.8%)
    74. work-cisco-systems                       (1 file, 3.8%)
    75. work-insperity                           (1 file, 3.8%)
    76. work-numo-llc                            (3 files, 11.5%)
    77. work-pnc-bank                            (2 files, 7.7%)
    78. work-rsa-security                        (1 file, 3.8%)
    79. work-upstart                             (3 files, 11.5%)
    80. year-2019                                (1 file, 3.8%)
    81. year-2022                                (5 files, 19.2%)

================================================================================

📋 DETAILED PER-FILE BREAKDOWN

 1. 2015-12-12 — Registration — Rogue — MassDOT — katherine-b-harris.pdf
    Keywords (6):
      - location-ma                         (used in 3 files)
      - vehicle-registration                (used in 1 file)
      - vehicle-rogue                       (used in 2 files)
      - location-watertown                  (used in 2 files)
      - katherine-b-harris                  (used in 6 files)
      - expired                             (used in 3 files)

 2. 2017-12-21— Inspection Report — Rogue — Katherine.pdf
    Keywords (6):
      - vehicle                             (used in 2 files)
      - vehicle-rogue                       (used in 2 files)
      - location-ma                         (used in 3 files)
      - vehicle-inspection-report           (used in 1 file)
      - expired                             (used in 3 files)
      - not-duplicate                       (used in 1 file)

 3. 2019-08-25 — Receipt — Donation — John Pierce.pdf
    Keywords (11):
      - receipt                             (used in 4 files)
      - financial                           (used in 11 files)
      - donation                            (used in 1 file)
      - tax-deductible                      (used in 1 file)
      - keep-7yr                            (used in 6 files)
      - receipt-donation                    (used in 1 file)
      - john-n-pierce                       (used in 7 files)
      - year-2019                           (used in 1 file)
      - org-bikes-not-bombs                 (used in 1 file)
      - location-ma                         (used in 3 files)
      - location-watertown                  (used in 2 files)

 4. 2020-03-14—Invoice—Firestone Complete Auto Care—John Pierce.pdf
    Keywords (9):
      - invoice                             (used in 1 file)
      - vehicle                             (used in 2 files)
      - paid                                (used in 3 files)
      - location-tx                         (used in 1 file)
      - john-n-pierce                       (used in 7 files)
      - vehicle-yaris                       (used in 1 file)
      - location-austin                     (used in 9 files)
      - vendor-firestone-complete-auto-care (used in 1 file)
      - vehicle-maintenance                 (used in 1 file)

 5. 2021-10-26 — Report — Teacher Conference — felix-pierce.pdf
    Keywords (4):
      - school                              (used in 4 files)
      - assessment                          (used in 3 files)
      - school-bluebonnet                   (used in 1 file)
      - felix-b-pierce                      (used in 1 file)

 6. 2022-02-01 — 1095-C — Taxes — Proof of Coverage — Katherine.pdf
    Keywords (11):
      - tax-form                            (used in 7 files)
      - insurance                           (used in 1 file)
      - financial                           (used in 11 files)
      - keep-7yr                            (used in 6 files)
      - active                              (used in 1 file)
      - work-numo-llc                       (used in 3 files)
      - taxes-1095-c                        (used in 1 file)
      - katherine-b-harris                  (used in 6 files)
      - location-austin                     (used in 9 files)
      - proof-of-coverage                   (used in 2 files)
      - medical                             (used in 2 files)

 7. 2022-02-01 — 1099-R — Upstart — john-n-pierce.pdf
    Keywords (11):
      - tax-form                            (used in 7 files)
      - financial                           (used in 11 files)
      - keep-7yr                            (used in 6 files)
      - taxes-1099-r                        (used in 2 files)
      - taxes-keep-7yr                      (used in 3 files)
      - work-insperity                      (used in 1 file)
      - location-austin                     (used in 9 files)
      - location-TX                         (used in 7 files)
      - taxes-2022                          (used in 3 files)
      - work-upstart                        (used in 3 files)
      - john-n-pierce                       (used in 7 files)

 8. 2022-02-01 — W-2 — Taxes — Upstart — john-n-pierce.pdf
    Keywords (10):
      - tax-form                            (used in 7 files)
      - tax                                 (used in 3 files)
      - financial                           (used in 11 files)
      - john-n-pierce                       (used in 7 files)
      - needs-filing                        (used in 1 file)
      - taxes-2022                          (used in 3 files)
      - taxes-w-2                           (used in 4 files)
      - work-upstart                        (used in 3 files)
      - location-austin                     (used in 9 files)
      - location-TX                         (used in 7 files)

 9. 2022-02-01 — W-2 — Taxes — katherine-b-harris.pdf
    Keywords (9):
      - financial                           (used in 11 files)
      - katherine-b-harris                  (used in 6 files)
      - keep-7yr                            (used in 6 files)
      - taxes-2022                          (used in 3 files)
      - work-pnc-bank                       (used in 2 files)
      - location-austin                     (used in 9 files)
      - location-TX                         (used in 7 files)
      - taxes-w-2                           (used in 4 files)
      - taxes-save7yr                       (used in 2 files)

10. 2022-02-01— 1095-C —Tax Form —john-n-pierce.pdf
    Keywords (5):
      - tax-form                            (used in 7 files)
      - financial                           (used in 11 files)
      - year-2022                           (used in 5 files)
      - taxes-1095                          (used in 1 file)
      - proof-of-coverage                   (used in 2 files)

11. 2022-11-08 — form — Change in Transportation Arrangements — alexandra-pierce.pdf
    Keywords (3):
      - form                                (used in 3 files)
      - school                              (used in 4 files)
      - alexandra-pierce                    (used in 1 file)

12. 2022-11-09 — Art Project — Canyon Creek — Alexandra.pdf
    Keywords (7):
      - alexandra-f-pierce                  (used in 4 files)
      - school-canyon-creek                 (used in 3 files)
      - teacher-barnard                     (used in 1 file)
      - grade-first                         (used in 1 file)
      - year-2022                           (used in 5 files)
      - artwork                             (used in 2 files)
      - schoolwork                          (used in 3 files)

13. 2022-11-09 — Art — Alexandra.pdf
    Keywords (7):
      - art                                 (used in 2 files)
      - abstract                            (used in 1 file)
      - painting                            (used in 1 file)
      - alexandra-f-pierce                  (used in 4 files)
      - artwork                             (used in 2 files)
      - schoolwork                          (used in 3 files)
      - year-2022                           (used in 5 files)

14. 2022-11-09 — Artwork — Canyon Creek — Alexandra.pdf
    Keywords (2):
      - form                                (used in 3 files)
      - art                                 (used in 2 files)

15. 2022-11-09 — Schoolwork — Alexandra — Clouds.pdf
    Keywords (8):
      - school                              (used in 4 files)
      - assessment                          (used in 3 files)
      - alexandra-f-pierce                  (used in 4 files)
      - school-canyon-creek                 (used in 3 files)
      - schoolwork                          (used in 3 files)
      - clouds                              (used in 1 file)
      - science                             (used in 1 file)
      - year-2022                           (used in 5 files)

16. 2022-11-09 — Schoolwork — Canyon Creek — alexandra-f-pierce.pdf
    Keywords (6):
      - form                                (used in 3 files)
      - school                              (used in 4 files)
      - assessment                          (used in 3 files)
      - alexandra-f-pierce                  (used in 4 files)
      - school-canyon-creek                 (used in 3 files)
      - year-2022                           (used in 5 files)

17. 2023-01-01 — W-2 — Taxes — PNC Bank — Katherine Harris.pdf
    Keywords (10):
      - financial                           (used in 11 files)
      - katherine-b-harris                  (used in 6 files)
      - keep-7yr                            (used in 6 files)
      - taxes-w-2                           (used in 4 files)
      - taxes-2023                          (used in 4 files)
      - taxes-keep-7yr                      (used in 3 files)
      - location-austin                     (used in 9 files)
      - location-TX                         (used in 7 files)
      - work-pnc-bank                       (used in 2 files)
      - work-numo-llc                       (used in 3 files)

18. 2023-01-01 — W-2 — Taxes — RSA Security — katherine-b-harris.pdf
    Keywords (12):
      - tax-form                            (used in 7 files)
      - financial                           (used in 11 files)
      - keep-7yr                            (used in 6 files)
      - taxes-2023                          (used in 4 files)
      - katherine-b-harris                  (used in 6 files)
      - taxes-w-2                           (used in 4 files)
      - location-austin                     (used in 9 files)
      - location-TX                         (used in 7 files)
      - work-rsa-security                   (used in 1 file)
      - work-archer-irm                     (used in 1 file)
      - work-numo-llc                       (used in 3 files)
      - taxes-keep-7yr                      (used in 3 files)

19. 2023-01-01 — W-2 — Taxes — katherine-b-harris.pdf
    Keywords (10):
      - tax-form                            (used in 7 files)
      - tax                                 (used in 3 files)
      - financial                           (used in 11 files)
      - katherine-b-harris                  (used in 6 files)
      - taxes-W2                            (used in 1 file)
      - work-cisco-systems                  (used in 1 file)
      - taxes-2023                          (used in 4 files)
      - taxes-save7yr                       (used in 2 files)
      - location-austin                     (used in 9 files)
      - location-TX                         (used in 7 files)

20. 2023-01-03 — Statement— PNC ISP — katherine-harris.pdf
    Keywords (7):
      - statement                           (used in 1 file)
      - financial                           (used in 11 files)
      - katherine-harris                    (used in 1 file)
      - no-split-needed                     (used in 1 file)
      - pnc-bank-isp                        (used in 1 file)
      - vendor-pnc-bank                     (used in 1 file)
      - financial-retirement                (used in 1 file)

21. 2023-02-01 — 1099-R — Tax — Upstart —john-n-pierce.pdf
    Keywords (9):
      - tax-form                            (used in 7 files)
      - tax                                 (used in 3 files)
      - financial                           (used in 11 files)
      - john-n-pierce                       (used in 7 files)
      - work-upstart                        (used in 3 files)
      - location-austin                     (used in 9 files)
      - location-TX                         (used in 7 files)
      - taxes-1099-r                        (used in 2 files)
      - taxes-2023                          (used in 4 files)

22. 2023-10-01 — Business Card — Perez Tree Service — Jose Perez.pdf
    Keywords (3):
      - home                                (used in 1 file)
      - perez-tree-service                  (used in 1 file)
      - business-card                       (used in 1 file)

23. 2023-10-09 — Insurance Card — Guardian VSP — john-n-pierce.pdf
    Keywords (6):
      - insurance-card                      (used in 1 file)
      - medical                             (used in 2 files)
      - guardian                            (used in 1 file)
      - john-n-pierce                       (used in 7 files)
      - expired                             (used in 3 files)
      - vision                              (used in 1 file)

24. 2023-10-19 — Receipt — Grocery — HEB.pdf
    Keywords (4):
      - receipt                             (used in 4 files)
      - grocery                             (used in 3 files)
      - heb                                 (used in 3 files)
      - paid                                (used in 3 files)

25. 2025-07-20—receipt—Grocery—HEB.pdf
    Keywords (4):
      - receipt                             (used in 4 files)
      - grocery                             (used in 3 files)
      - heb                                 (used in 3 files)
      - john-n-pierce                       (used in 7 files)

26. 2025-09-30 — Receipt — Grocery — HEB.pdf
    Keywords (4):
      - receipt                             (used in 4 files)
      - grocery                             (used in 3 files)
      - heb                                 (used in 3 files)
      - paid                                (used in 3 files)

================================================================================

✅ Analysis complete!

