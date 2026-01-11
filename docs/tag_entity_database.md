# Tag Entity Database
**Project:** PDF Organization System
**Created:** January 9, 2026
**Purpose:** Central registry for entities requiring unique tag slugs

---

## People Registry

Each person gets a unique slug based on: `fname-mname-lname` (use 'x' if middle name unknown)

| Full Name | Tag Slug | Relationship | Birth Year | Notes |
|-----------|----------|--------------|------------|-------|
| Katherine B. Harris | `katherine-b-harris` | Self | - | Primary account holder |
| John N. Pierce | `john-n-pierce` | Spouse | - | Husband, also "Nick", primary grocery shopper |
| John M. Pierce | `john-m-pierce` | Father-in-law | - | - |
| Alexandra F. Pierce | `alexandra-f-pierce` | Daughter | - | Also seen as "Alex" |
| Felix B. Pierce | `felix-b-pierce` | Son | - | - |
| Roger W. Harris | `roger-w-harris` | Father | - | Lives with family |
| Jennifer B. Harris | `jennifer-b-harris` | Mother | - | Lives with family |
| Audrey P. Burnett | `audrey-p-burnett` | Sister-in-law | - | - |
| Jeffrey D. Harris | `jeffrey-d-harris` | Brother | - | - |
| Wilbur R. Pierce | `wilbur-r-pierce` | Pet (Dog) | - | Chihuahua Mix, neutered male, born 09/29/2023 |

### Instructions for Adding New People:
1. Use format: `fname-mname-lname`
2. If middle name unknown, use 'x': `fname-x-lname`
3. For multiple middle names, use first middle initial only: `fname-m-lname`
4. If duplicate exists after this, add birth year: `fname-mname-lname-1985`
5. Add entry to table above
6. Note any alternate names/nicknames in Notes column

---

## Vendor/Provider Registry

Standardized vendor slugs for consistency. Group by category for easy reference.

### Retail Vendors

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| HEB | `heb` | Grocery | - |
| Target | `target` | Retail | - |
| Walmart | `walmart` | Retail | - |
| Costco | `costco` | Retail | - |
| Dollar Tree | `dollar-tree` | Retail | - |
| CVS Pharmacy | `cvs` | Pharmacy/Retail | - |
| Walgreens | `walgreens` | Pharmacy/Retail | - |
| Michaels | `michaels` | Crafts | - |
| Academy Sports + Outdoors | `academy` | Sports/Outdoors | - |
| Lowe's | `lowes` | Home Improvement | - |
| Home Depot | `home-depot` | Home Improvement | - |
| IKEA | `ikea` | Furniture | - |
| Marshalls | `marshalls` | Retail | - |
| Nordstrom Rack | `nordstrom-rack` | Retail | - |
| DSW | `dsw` | Shoes | - |
| Five Below | `five-below` | Retail | - |
| AutoZone | `autozone` | Auto Parts | - |
| Bath & Body Works | `bath-body-works` | Retail | - |
| Dillard's | `dillards` | Retail | - |

### Medical/Healthcare Providers

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Austin Regional Clinic | `arc` | Medical | Multiple locations |
| Austin Regional Clinic - Cedar Park | `arc-cedar-park` | Medical | Specific location |
| Austin Regional Clinic - Far West | `arc-far-west` | Medical | Specific location |
| Austin Regional Clinic - Four Points | `arc-four-points` | Medical | Specific location |
| Austin Regional Clinic - Wilson Parke | `arc-wilson-parke` | Medical | Specific location |
| Dell Children's Medical Group | `dell-childrens` | Pediatric | - |
| Ascension Seton | `ascension-seton` | Hospital | - |
| Clinical Pathology Laboratories | `cpl` | Lab Services | - |
| Pediatrix | `pediatrix` | Pediatric Specialists | - |
| US Anesthesia Partners | `us-anesthesia` | Anesthesia | - |
| Austin Radiological Association | `ara` | Radiology | - |
| Pecan Park Family Dentistry | `pecan-park-dental` | Dental | - |
| Ortho360 Orthodontics | `ortho360` | Orthodontics | - |
| Children's Urology | `childrens-urology` | Pediatric Urology | - |
| Pediatric & Congenital Cardiology Associates | `pcca` | Pediatric Cardiology | - |
| VCA Animal Hospital | `vca` | Veterinary | - |
| Healthy Pet | `healthy-pet` | Veterinary | - |
| Happy Tails Pet Resort | `happy-tails` | Pet Care | - |

### Financial Institutions

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| PNC Bank | `pnc` | Banking | HSA provider |
| Northwestern Mutual | `northwestern-mutual` | Insurance/Investment | - |
| Morgan Stanley | `morgan-stanley` | Investment | - |
| Velocity Credit Union | `velocity` | Credit Union | - |
| MetLife | `metlife` | Insurance | - |
| United Healthcare | `united-healthcare` | Health Insurance | - |
| Aflac | `aflac` | Supplemental Insurance | - |
| Liberty Mutual | `liberty-mutual` | Insurance | - |
| American Express | `amex` | Credit Card | - |

### Schools & Educational

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Round Rock ISD | `rrisd` | School District | - |
| Canyon Creek Library | `canyon-creek-library` | Library | - |
| Girl Scouts of Central Texas | `girl-scouts-ctx` | Youth Organization | - |
| Scholastic | `scholastic` | Educational | Book fairs |
| Mo-Ranch | `mo-ranch` | Camp | Presbyterian camp |

### Restaurants & Food Service

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Whataburger | `whataburger` | Fast Food | - |
| Starbucks | `starbucks` | Coffee | - |
| Red Lobster | `red-lobster` | Restaurant | - |
| District Kitchen + Cocktails | `district-kitchen` | Restaurant | - |
| Sweet Tomatoes | `sweet-tomatoes` | Restaurant | - |
| Pinstack | `pinstack` | Entertainment/Dining | - |
| DoorDash | `doordash` | Delivery Service | - |
| Wildflowers ATX | `wildflowers-atx` | Restaurant | - |
| Nervous Charlie's | `nervous-charlies` | Restaurant | - |
| Bevo Bar + Pizzeria | `bevo-bar` | Restaurant | - |
| Crew Collectif & Cafe | `crew-collectif` | Cafe | - |
| Rutba Indian Cuisine | `rutba` | Restaurant | - |
| Cafe Medici | `cafe-medici` | Coffee | - |
| Pretz Pizza | `pretz-pizza` | Restaurant | - |

### Auto/Transportation Services

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Firestone Complete Auto Care | `firestone` | Auto Service | - |
| Complete Auto Care | `complete-auto` | Auto Service | Different from Firestone |
| Shell | `shell` | Gas Station | - |
| Chevron | `chevron` | Gas Station | - |
| CarMax | `carmax` | Auto Sales | - |
| Stan's AC | `stans-ac` | Auto Service | - |
| Delta Airlines | `delta` | Airline | - |
| Limo Tech Taxi | `limo-tech` | Transportation | - |
| USPS | `usps` | Postal Service | - |

### Home Services

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Holden Roofing | `holden-roofing` | Roofing | - |
| Miracle Method | `miracle-method` | Surface Refinishing | - |
| Molly Maid | `molly-maid` | Cleaning Service | - |
| The UPS Store | `ups-store` | Shipping/Services | - |

### Employment/Payroll

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Cisco Systems | `cisco` | Employer | - |
| Upstart Network | `upstart` | Employer | - |
| numo llc | `numo` | Employer | Katherine's employer via PNC payroll |
| Insperity | `insperity` | Payroll/HR Service | - |

### Entertainment & Recreation

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Upstairs Circus ATX | `upstairs-circus` | Entertainment | - |
| Lady Bird Johnson Wildflower Center | `lady-bird-johnson` | Recreation | - |

### Hotels & Lodging

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Courtyard by Marriott | `courtyard-marriott` | Hotel | - |

### Government & HOA

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Travis County | `travis-county` | Government | - |
| TxTag | `txtag` | Toll Service | - |
| Appletree HOA | `appletree-hoa` | HOA | Appears in many documents |
| Spectrum Association Management | `spectrum-am` | HOA Management | Manages Canyon Creek HOA |

### Nonprofit & Charitable Organizations

| Business Name | Tag Slug | Category | Notes |
|---------------|----------|----------|-------|
| Bikes Not Bombs | `bikes-not-bombs` | Nonprofit | Bicycle donation charity, Watertown MA |

---

## Usage Instructions

### Adding New Entities

**For People:**
1. Check if name already exists in People Registry
2. Create slug: `fname-mname-lname` (use 'x' if middle name unknown)
3. If duplicate name exists, append birth year
4. Add to table with all required information

**For Vendors:**
1. Check if vendor already exists in appropriate category
2. Create slug using lowercase and hyphens
3. Keep it short but recognizable (max 3-4 words)
4. Add to appropriate category table

### Tag Slug Best Practices
- Use lowercase only
- Separate words with hyphens (-)
- Keep slugs short (2-3 words max when possible)
- Be consistent: once a slug is created, don't change it
- For franchises with multiple locations, use base slug unless location matters

### When to Create Location-Specific Tags
Create location-specific variants when:
- Different locations have different account numbers
- You need to track spending by location
- Medical providers at different offices

Otherwise, use the generic vendor tag.

---

## Revision History
- v1.8 - January 9, 2026 - Added Wilbur R. Pierce (pet dog) to People Registry and Ortho360 Orthodontics to Medical providers
- v1.7 - January 9, 2026 - Added ARC Wilson Parke location and Spectrum Association Management
- v1.6 - January 9, 2026 - Added Bikes Not Bombs to Nonprofit & Charitable Organizations category
- v1.5 - January 9, 2026 - Added Roger W. Harris (father), Jennifer B. Harris (mother), Audrey P. Burnett (sister-in-law), Jeffrey D. Harris (brother)
- v1.4 - January 9, 2026 - Removed Diane Weires Haynes from People Registry
- v1.3 - January 9, 2026 - Added John N. Pierce (Nick/spouse), corrected John M. Pierce relationship to father-in-law
- v1.2 - January 9, 2026 - Added numo llc to Employment/Payroll
- v1.1 - January 9, 2026 - Updated person identifier format to fname-mname-lname (use 'x' if middle name unknown)
- v1.0 - January 9, 2026 - Initial entity database created
