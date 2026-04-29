const fs = require('fs');
let c1 = fs.readFileSync('src/pages/Configuracoes.tsx', 'utf8');
c1 = c1.replace(/<DashboardLayout title="Configurações" subtitle="Gerencie o seu sistema e preferências">/g, '<div className="space-y-6">');
c1 = c1.replace(/<DashboardLayout title="Configurações" subtitle="Carregando...">/g, '<div className="space-y-6">');
fs.writeFileSync('src/pages/Configuracoes.tsx', c1);

let c2 = fs.readFileSync('src/pages/EditarOS.tsx', 'utf8');
c2 = c2.replace(/<DashboardLayout title="Editar OS" subtitle="Carregando...">/g, '<div className="space-y-6">');
fs.writeFileSync('src/pages/EditarOS.tsx', c2);
