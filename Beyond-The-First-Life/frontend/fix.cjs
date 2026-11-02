const fs = require('fs');
const path = './src/pages/admin';
const files = fs.readdirSync(path);
files.forEach(f => {
  if (f.endsWith('.jsx')) {
    let content = fs.readFileSync(path + '/' + f, 'utf8');
    // We accidentally replaced `{b.map` with `{( || []).map`
    // Wait, in Batteries it was `{b.map` -> `{( || []).map`
    // In Users it was `{u.map` -> `{( || []).map`
    // In Marketplace it was `{x.map` -> `{( || []).map`
    // Let's just fix the syntax error directly.
    if (f === 'Batteries.jsx') content = content.replace(/\{\( \|\| \[\]\)/g, '{(b || [])');
    if (f === 'Users.jsx') content = content.replace(/\{\( \|\| \[\]\)/g, '{(u || [])');
    if (f === 'Marketplace.jsx') content = content.replace(/\{\( \|\| \[\]\)/g, '{(x || [])');
    if (f === 'Transactions.jsx') content = content.replace(/\{\( \|\| \[\]\)/g, '{(x || [])');
    if (f === 'Pricing.jsx') content = content.replace(/\{\( \|\| \[\]\)/g, '{(p || [])');
    fs.writeFileSync(path + '/' + f, content);
  }
});
console.log('Fixed');
