// Prints a patch; never edits the rollback application. Run from the web repo root.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve('package.json'));
const postcss = require('postcss');
const roots = ['management/ManagerPage','management/AnalyticsPage','management/ReportsPage','management/ActionHistoryPage','management/ReviewPages','management/QuestionReviewPage','management/ManagerAccountPage','applications/ApplicationsPage','catalog/CatalogPage'];
const files = new Set();
function visit(file) {
  if (files.has(file)) return;
  files.add(file);
  for (const match of fs.readFileSync(file,'utf8').matchAll(/from\s*['"](\.[^'"]+)['"]/g)) {
    const base = path.resolve(path.dirname(file),match[1]);
    const child = [base+'.tsx',base+'.ts'].find(fs.existsSync);
    if (child) visit(child);
  }
}
roots.forEach(root => visit(path.resolve('src/features/'+root+'.tsx')));
let patch = '*** Begin Patch\n';
function add(file, content) { patch += '*** Add File: '+path.resolve('next-app/src/manager-legacy',file)+'\n'+content.trimEnd().split('\n').map(line=>'+'+line).join('\n')+'\n'; }
for (const file of files) {
  const relative = path.relative(path.resolve('src'),file);
  if (relative==='features/auth/useAuth.ts') continue;
  let source = fs.readFileSync(file,'utf8').replaceAll("'react-router-dom'","'@/manager-legacy/navigation'").replace(/\bAdmin\b/g,'Tanıdık');
  if (relative==='api/apiClient.ts') {
    source = source.replace(/const baseUrl = .*\n/, "const baseUrl = ''\n");
    source = source.replace('`${baseUrl}${path}`', "`${baseUrl}${path.replace(/^\\/api\\//, '/api/backend/').replaceAll('admin-applications', 'tanidik-applications').replaceAll('revoke-admin', 'revoke-tanidik')}`");
  }
  if (relative==='features/notifications/notifications.ts') source = "export { mutationNotice } from '@/lib/notifications';\n";
  add(relative,source);
}
const css = postcss.parse(fs.readFileSync('src/styles.css','utf8'));
css.walkRules(rule => {
  if (rule.parent.type==='atrule' && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors = rule.selectors.map(selector => {
    if (selector.startsWith(':root') || selector==='body' || selector==='html') return '.manager-shell.manager-shell';
    return '.manager-shell.manager-shell '+selector;
  });
});
add('manager.css','/* Copied from the rollback stylesheet; scoped to Manager. */\n'+css.toString()+'\n');
patch += '*** End Patch';
process.stdout.write(patch);
