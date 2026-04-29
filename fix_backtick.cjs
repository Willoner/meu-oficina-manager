const fs = require('fs');
let c = fs.readFileSync('src/pages/EditarOS.tsx', 'utf8');
// Fix the problematic template literal with setLayoutProps
const oldLine = '      setLayoutProps({ subtitle: `Editando O.S. #${id.substring(0, 8).toUpperCase()}` });';
const newLine = '      setLayoutProps({ subtitle: "Editando OS #" + id.substring(0, 8).toUpperCase() });';
c = c.replace(oldLine, newLine);
fs.writeFileSync('src/pages/EditarOS.tsx', c, 'utf8');
console.log('Fixed. Replacement happened:', c.includes(newLine));
