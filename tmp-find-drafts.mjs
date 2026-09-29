import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
const drafts = [];
function checkDir(dir) {
  try {
    const items = readdirSync(dir, {withFileTypes: true});
    for (const item of items) {
      const full = join(dir, item.name);
      if (item.isDirectory()) {
        checkDir(full);
      } else if (item.name.endsWith('.md')) {
        const content = readFileSync(full, 'utf8');
        const pubMatch = content.match(/published:\s*(false)/i);
        const idMatch = content.match(/^id:\s*(.+)/m);
        if (pubMatch) {
          drafts.push({file: full.replace('src/content/', ''), id: idMatch ? idMatch[1].trim() : 'unknown'});
        }
      }
    }
  } catch (e) {}
}
checkDir('src/content');
console.log(JSON.stringify(drafts, null, 2));
