import { readFileSync } from 'fs';
const m = JSON.parse(readFileSync('src/generated/manifest.json', 'utf8'));
const e = JSON.parse(readFileSync('src/generated/entities.json', 'utf8'));
const s = JSON.parse(readFileSync('src/generated/search-index.json', 'utf8'));

const manifestIds = new Set();
const entityIds = new Set();
const searchIds = new Set();

for (const item of m.items || m.entities || []) {
  manifestIds.add(item.id || item);
}
for (const item of e) {
  entityIds.add(item.id || item.id);
}
for (const item of s) {
  searchIds.add(item.id || item.id || item.key);
}

// Try different formats
const manifestList = Array.isArray(m) ? m : (m.entities || m.items || []);
console.log('manifest type:', typeof m, 'isArray:', Array.isArray(m));
console.log('manifest keys:', Object.keys(m).slice(0,10));
console.log('manifest length:', manifestList.length);
console.log('entities length:', e.length);
console.log('search length:', s.length);

// Find differences
const manifestIdSet = new Set();
const entityIdSet = new Set();
const searchIdSet = new Set();

for (const item of manifestList) {
  const id = typeof item === 'string' ? item : (item.id || item._id || '');
  manifestIdSet.add(id);
}
for (const item of e) {
  const id = typeof item === 'string' ? item : (item.id || item._id || '');
  entityIdSet.add(id);
}
for (const item of s) {
  const id = typeof item === 'string' ? item : (item.id || item._id || item.key || '');
  searchIdSet.add(id);
}

console.log('\nManifest IDs:', manifestIdSet.size);
console.log('Entity IDs:', entityIdSet.size);
console.log('Search IDs:', searchIdSet.size);

// In manifest but not entity
for (const id of manifestIdSet) {
  if (!entityIdSet.has(id)) console.log('In manifest but not entity:', id);
}
for (const id of entityIdSet) {
  if (!manifestIdSet.has(id)) console.log('In entity but not manifest:', id);
}
for (const id of entityIdSet) {
  if (!searchIdSet.has(id)) console.log('In entity but not search:', id);
}
for (const id of searchIdSet) {
  if (!entityIdSet.has(id)) console.log('In search but not entity:', id);
}
