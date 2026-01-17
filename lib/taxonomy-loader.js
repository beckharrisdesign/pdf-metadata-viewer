import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Taxonomy file path (consolidated database)
const TAXONOMY_DATABASE_FILE = join(__dirname, '..', 'docs', 'tag_entity_database.md');

// Cache for loaded taxonomy
let taxonomyCache = null;

/**
 * Loads and parses the complete taxonomy from tag files and entity database.
 * Returns a cached result on subsequent calls.
 * 
 * @returns {Promise<Object>} Taxonomy object with:
 *   - documentTypes: Array of document type tags
 *   - categories: Array of category tags
 *   - actions: Array of action tags
 *   - statuses: Array of status tags
 *   - specials: Array of special flag tags
 *   - locations: Array of location tags
 *   - people: Array of people slugs from entity database
 *   - vendors: Array of vendor/org slugs from entity database (all non-people entities)
 */
export async function loadTaxonomy() {
  // Return cached taxonomy if available
  if (taxonomyCache) {
    return taxonomyCache;
  }

  try {
    const databaseContent = await readFile(TAXONOMY_DATABASE_FILE, 'utf-8');

    // Helper function to extract tag slugs from table rows (first column)
    const extractTagsFromTable = (sectionContent) => {
      // Match table rows: | `tag-slug` | ... |
      // Skip header separator rows (those with ---)
      const allMatches = [...sectionContent.matchAll(/\| `([^`]+)` \|/g)];
      return allMatches
        .map(m => m[1])
        .filter(tag => !tag.includes('---') && tag !== 'Tag Slug'); // Filter out separators and headers
    };

    // Extract document types from table (first column is Tag Slug)
    const docTypesMatch = databaseContent.match(/### 1\. DOCUMENT TYPE TAGS[\s\S]*?(?=### 2\.|$)/);
    const docTypes = docTypesMatch ? extractTagsFromTable(docTypesMatch[0]) : [];

    // Extract category tags from table (first column is Tag Slug)
    const categoryMatch = databaseContent.match(/### 2\. CATEGORY TAGS[\s\S]*?(?=### 3\.|$)/);
    const categories = categoryMatch ? extractTagsFromTable(categoryMatch[0]) : [];

    // Extract status/action tags from table (first column is Tag Slug)
    const statusActionMatch = databaseContent.match(/### 3\. STATUS\/ACTION TAGS[\s\S]*?(?=### 4\.|$)/);
    const statusActions = statusActionMatch ? extractTagsFromTable(statusActionMatch[0]) : [];
    
    // For backward compatibility, split into actions and statuses based on common patterns
    // Actions: workflow/retention tags
    const actions = statusActions.filter(tag => 
      tag.includes('needs-') || tag.includes('keep-') || tag === 'paid' || 
      tag === 'reimbursable' || tag === 'tax-deductible' || tag === 'scan-only' || 
      tag === 'original-required' || tag === 'follow-up-needed'
    );
    
    // Statuses: document state tags
    const statuses = statusActions.filter(tag => 
      tag === 'active' || tag === 'expired' || tag === 'superseded' || 
      tag.includes('duplicate') || tag === 'void' || tag === 'draft' || 
      tag === 'needs-deleting'
    );

    // Extract special flags from table (first column is Tag Slug)
    const specialMatch = databaseContent.match(/### 5\. SPECIAL FLAGS[\s\S]*?(?=### 6\.|$)/);
    const specials = specialMatch ? extractTagsFromTable(specialMatch[0]) : [];

    // Extract location tags from table (first column is Tag Slug)
    // Match until the next major section (--- separator or ## heading)
    const locationMatch = databaseContent.match(/### 6\. LOCATION TAGS[\s\S]*?(?=\n---|\n## Entity Registries|$)/);
    const locations = locationMatch ? extractTagsFromTable(locationMatch[0]) : [];

    // Extract people from entity database with full names
    // People are in a table with format: | Full Name | Tag Slug | ...
    const peopleMatch = databaseContent.match(/## People Registry[\s\S]*?(?=## Vendor|$)/);
    const people = [];
    const peopleWithNames = [];
    if (peopleMatch) {
      // Match table rows: | Full Name | `tag-slug` | ...
      const peopleRows = [...peopleMatch[0].matchAll(/\| ([^|]+)\| `([^`]+)` \|/g)];
      peopleRows.forEach(match => {
        const fullName = match[1].trim();
        const slug = match[2].trim();
        if (slug !== 'Tag Slug' && !slug.includes('---') && fullName !== 'Full Name') {
          people.push(slug);
          peopleWithNames.push({ name: fullName, slug: slug });
        }
      });
    }

    // Extract vendors/orgs from entity database with business names
    // Vendors are in tables within the Vendor/Provider/Organization Registry section
    // Format: | Business Name | `tag-slug` | Category | Notes |
    const vendorRegistryMatch = databaseContent.match(/## Vendor\/Provider\/Organization Registry[\s\S]*?(?=\n---|\n## Tagging|$)/);
    const vendors = [];
    const vendorsWithNames = [];
    if (vendorRegistryMatch) {
      // Match table rows: | Business Name | `tag-slug` | ...
      const vendorRows = [...vendorRegistryMatch[0].matchAll(/\| ([^|]+)\| `([^`]+)` \|/g)];
      vendorRows.forEach(match => {
        const businessName = match[1].trim();
        const slug = match[2].trim();
        if (slug !== 'Tag Slug' && !slug.includes('---') && businessName !== 'Business Name' && !people.includes(slug)) {
          vendors.push(slug);
          vendorsWithNames.push({ name: businessName, slug: slug });
        }
      });
    }

    taxonomyCache = {
      documentTypes: docTypes,
      categories: categories,
      actions: actions,
      statuses: statuses,
      specials: specials,
      locations: locations,
      people: people,
      vendors: vendors,
      peopleWithNames: peopleWithNames, // New: includes full names for matching
      vendorsWithNames: vendorsWithNames // New: includes business names for matching
    };

    return taxonomyCache;
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    // Return empty taxonomy if files don't exist
    return {
      documentTypes: [],
      categories: [],
      actions: [],
      statuses: [],
      specials: [],
      locations: [],
      people: [],
      vendors: [],
      peopleWithNames: [],
      vendorsWithNames: []
    };
  }
}

/**
 * Clears the taxonomy cache. Useful for testing or when taxonomy files are updated.
 */
export function clearTaxonomyCache() {
  taxonomyCache = null;
}
