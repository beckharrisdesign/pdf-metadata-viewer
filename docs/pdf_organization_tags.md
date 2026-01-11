# PDF Organization - Tag/Keyword Structure
**Project:** To Be Filed Folder Organization
**Created:** January 9, 2026
**Owner:** Katherine Harris

## Purpose
This document defines a flat (non-hierarchical) tag/keyword system for organizing PDFs. Tags can be combined freely to enable flexible searching and indexing.

**Companion Document:** `tag_entity_database.md` - Contains registries for people and vendors with unique tag slugs.

---

## Tag Categories & Keywords

### 1. DOCUMENT TYPE TAGS
These describe what kind of document it is:

- `receipt` - Purchase receipts
- `invoice` - Billing invoices
- `statement` - Account statements, summaries
- `bill` - Bills requiring payment
- `tax-form` - Tax-related forms (W-2, 1095-C, etc.)
- `medical-record` - Medical visit notes, test results
- `prescription` - Prescription documents
- `insurance-card` - Insurance cards/verification
- `eob` - Explanation of Benefits
- `registration` - Vehicle or other registrations
- `inspection` - Vehicle inspections
- `contract` - Contracts, agreements
- `letter` - Correspondence, letters
- `form` - Forms (blank or filled)
- `report-card` - School report cards
- `assessment` - School assessments, test results
- `certificate` - Certificates, awards
- `ticket` - Event tickets, passes
- `itinerary` - Travel itineraries
- `map` - Maps, directions
- `menu` - Restaurant menus
- `flyer` - Promotional flyers, advertisements
- `instruction` - Instructions, manuals
- `warranty` - Warranty documents
- `quote` - Service quotes, estimates

### 2. CATEGORY TAGS
Broad subject area:

- `medical` - Healthcare related
- `dental` - Dental care
- `vision` - Vision/eye care
- `veterinary` - Pet medical care
- `financial` - Banking, investments, loans
- `tax` - Tax documents
- `insurance` - Insurance (health, auto, home, life)
- `school` - K-12 education
- `camp` - Summer camps, activities
- `vehicle` - Car/vehicle related
- `home` - Home maintenance, services
- `utilities` - Electric, water, gas, internet
- `hoa` - Homeowner association
- `retail` - Shopping, purchases
- `grocery` - Food shopping
- `restaurant` - Dining out
- `travel` - Travel, lodging, transportation
- `entertainment` - Entertainment, recreation
- `membership` - Memberships, subscriptions
- `employment` - Work, payroll, benefits
- `legal` - Legal documents
- `government` - Government agencies, DMV, IRS

### 3. VENDOR/PROVIDER TAGS
Organizations and businesses use standardized slugs from the Tag Entity Database.

Common examples:
- `heb`, `target`, `walmart` - Retail
- `arc`, `dell-childrens`, `vca` - Medical providers
- `pnc`, `northwestern-mutual`, `velocity` - Financial institutions
- `rrisd`, `girl-scouts-ctx` - Schools and education
- `firestone`, `complete-auto`, `shell` - Auto services
- `cisco`, `upstart`, `insperity` - Employment

**See `tag_entity_database.md` for:**
- Complete vendor registry organized by category
- How to create new vendor slugs
- Guidelines for location-specific tags

### 4. PERSON TAGS
People associated with the document use unique identifiers from the Tag Entity Database.

Format: `fname-mname-lname` (use 'x' if middle name unknown, e.g., `john-x-smith`)

Examples from current database:
- `katherine-b-harris` - Katherine B. Harris
- `john-m-pierce` - John M. Pierce
- `alexandra-f-pierce` - Alexandra F. Pierce
- `felix-b-pierce` - Felix B. Pierce
- `diane-weires-haynes` - Diane Weires Haynes

**See `tag_entity_database.md` for complete people registry and how to add new people.**

### 5. ACTION TAGS
What needs to be done:

- `needs-filing` - Awaiting permanent filing
- `needs-payment` - Bill needs to be paid
- `paid` - Already paid
- `reimbursable` - Can be reimbursed
- `tax-deductible` - Tax deductible expense
- `keep-annual` - Keep for 1 year
- `keep-7yr` - Keep for 7 years (tax requirement)
- `keep-permanent` - Keep permanently
- `scan-only` - Original can be discarded after scanning
- `original-required` - Must keep physical original

### 6. TIME PERIOD TAGS
Simple date-based tags for when the filename date alone isn't sufficient:

- `year-2024` - Calendar year 2024
- `year-2025` - Calendar year 2025
- `month-01` - January (use 01-12)
- `month-02` - February
- `month-12` - December
- `week-01` - Week 1 of the year (use 01-52)
- `week-26` - Week 26 of the year
- `day-01` - First day of month (use 01-31)
- `day-15` - 15th day of month

**Notes:** 
- Combine as needed: `year-2024 month-03` for March 2024
- Week numbers follow ISO 8601 (week starting Monday)
- Use filename dates for primary dating; these tags are for additional context or grouping

### 7. STATUS TAGS
Document status:

- `active` - Currently active/relevant
- `expired` - No longer valid
- `superseded` - Replaced by newer version
- `duplicate` - Duplicate copy
- `void` - Voided document
- `draft` - Draft version

### 8. SPECIAL FLAGS
Important markers:

- `multi-doc` - Contains multiple separate documents (NEEDS SPLITTING)
- `confidential` - Contains sensitive information
- `original-scan` - Scanned from physical original
- `incomplete` - Missing pages or information
- `illegible` - Poor quality, hard to read
- `follow-up-needed` - Requires follow-up action
- `warranty-active` - Active warranty
- `recurring` - Recurring service/subscription

### 9. LOCATION TAGS
Geographic location where document originated (useful for tracking across moves):

- `location-watertown-ma` - Watertown, Massachusetts residence
- `location-austin-tx` - Austin, Texas residence
- `location-ma` - Massachusetts (state level)
- `location-tx` - Texas (state level)

**Usage Notes:**
- Use specific city tags when the exact location matters (different addresses, services)
- Use state tags for general regional identification
- Helpful for tracking documents across moves, state-specific tax forms, regional services

---

## Tagging Examples

**Example 1:** HEB grocery receipt from March 2025
```
Tags: receipt, grocery, retail, heb, katherine-b-harris, paid, scan-only, year-2025, month-03
```

**Example 2:** Alexandra's school report card
```
Tags: report-card, school, rrisd, alexandra-f-pierce, keep-permanent, year-2025
```

**Example 3:** PNC tax form 1095-C
```
Tags: tax-form, financial, insurance, pnc, john-m-pierce, katherine-b-harris, year-2024, keep-7yr
```

**Example 4:** Multi-page medical bill with multiple family members
```
Tags: bill, statement, medical, arc, katherine-b-harris, felix-b-pierce, needs-payment, multi-doc, keep-7yr
```

**Example 5:** Vehicle inspection
```
Tags: inspection, vehicle, firestone, john-m-pierce, keep-annual, paid, year-2025
```

**Example 6:** Donation receipt from Massachusetts residence
```
Tags: receipt, tax-form, donation, bikes-not-bombs, john-n-pierce, keep-7yr, year-2019, location-watertown-ma
```
