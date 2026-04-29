import fs from 'fs';
import path from 'path';

const pagesDir = './src/pages';
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  if (['Index.tsx', 'Landing.tsx', 'Login.tsx', 'Signup.tsx', 'ForgotPassword.tsx', 'ResetPassword.tsx', 'PublicOS.tsx', 'CheckoutSuccess.tsx', 'CheckoutCancel.tsx', 'TermosUso.tsx', 'PoliticaPrivacidade.tsx', 'NotFound.tsx'].includes(file)) return;

  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has useLayout
  if (content.includes('useLayout')) return;

  // 1. Remove import DashboardLayout
  content = content.replace(/import DashboardLayout from ["']@\/components\/layout\/DashboardLayout["'];\n?/g, '');
  
  // 2. Add import { useLayout } from "@/contexts/LayoutContext";
  content = content.replace(/(import .*;\n)(?=[^\n]*\n*const [A-Z])/, '$1import { useLayout } from "@/contexts/LayoutContext";\nimport { useEffect } from "react";\n');

  // 3. Find the main component name
  const compMatch = content.match(/const ([A-Z][a-zA-Z0-9]+) = /);
  if (!compMatch) return;
  const compName = compMatch[1];

  // 4. Inject useLayout hook inside the component
  const hookInjection = `\n  const { setLayoutProps } = useLayout();\n`;
  content = content.replace(new RegExp(`(const ${compName} = [^{]+\\{)`), `$1${hookInjection}`);

  // 5. Replace <DashboardLayout title="X" subtitle="Y"> with <div className="space-y-6"> and extract props
  let title = "Dashboard";
  let subtitle = "";
  let hideSidebar = "false";
  let hideHeader = "false";

  // Match the opening DashboardLayout tag, handling multi-line attributes
  const layoutRegex = /<DashboardLayout\s+([^>]+)>/;
  const layoutMatch = content.match(layoutRegex);
  
  if (layoutMatch) {
    const attrs = layoutMatch[1];
    const tMatch = attrs.match(/title=["']([^"']+)["']/);
    if (tMatch) title = tMatch[1];
    
    const sMatch = attrs.match(/subtitle=["']([^"']+)["']/);
    if (sMatch) subtitle = sMatch[1];
    
    if (attrs.includes('hideSidebarOnPrint')) hideSidebar = "true";
    if (attrs.includes('hideHeaderOnPrint')) hideHeader = "true";

    content = content.replace(layoutRegex, '<div className="space-y-6">');
  }

  // 6. Inject useEffect to set layout props
  const effectInjection = `
  useEffect(() => {
    setLayoutProps({
      title: "${title}",
      subtitle: "${subtitle}",
      hideSidebarOnPrint: ${hideSidebar},
      hideHeaderOnPrint: ${hideHeader}
    });
  }, [setLayoutProps]);\n`;
  
  content = content.replace(hookInjection, `${hookInjection}${effectInjection}`);

  // 7. Replace closing </DashboardLayout>
  content = content.replace(/<\/DashboardLayout>/g, '</div>');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
