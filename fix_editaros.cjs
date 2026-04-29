const fs = require('fs');

// Read the file as UTF-8
let content = fs.readFileSync('src/pages/EditarOS.tsx', 'utf8');

// 1. Replace DashboardLayout import
content = content.replace(
  "import DashboardLayout from \"@/components/layout/DashboardLayout\";",
  "import { useLayout } from \"@/contexts/LayoutContext\";"
);

// 2. Add useLayout hook after const EditarOS = () => {
content = content.replace(
  "const EditarOS = () => {\r\n  const { id } = useParams();",
  "const EditarOS = () => {\r\n  const { id } = useParams();\r\n  const { setLayoutProps } = useLayout();\r\n\r\n  useEffect(() => {\r\n    setLayoutProps({ title: 'Editar OS', subtitle: 'Carregando...' });\r\n  }, [setLayoutProps]);\r\n"
);

// 3. Update subtitle dynamically after loading
content = content.replace(
  "      setObservacoes(osData.observacoes || \"\");",
  "      setObservacoes(osData.observacoes || \"\");\r\n      setLayoutProps({ subtitle: `Editando O.S. #${id.substring(0, 8).toUpperCase()}` });"
);

// 4. Replace loading return (single line DashboardLayout)
content = content.replace(
  "      <DashboardLayout title=\"Editar OS\" subtitle=\"Carregando...\">\r\n        <div className=\"flex items-center justify-center min-h-[400px]\">\r\n          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-primary\"></div>\r\n        </div>\r\n      </DashboardLayout>",
  "      <div className=\"space-y-6\">\r\n        <div className=\"flex items-center justify-center min-h-[400px]\">\r\n          <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-primary\"></div>\r\n        </div>\r\n      </div>"
);

// 5. Replace the main DashboardLayout opening tag (multiline)
content = content.replace(
  "    <DashboardLayout \r\n      title=\"Editar OS\" \r\n      subtitle={`Editando Ordem de Servi\u00e7o #${id?.substring(0, 8).toUpperCase()}`}\r\n    >\r\n      <div className=\"space-y-6 pb-24 max-w-5xl mx-auto\">",
  "    <div className=\"space-y-6\">\r\n      <div className=\"space-y-6 pb-24 max-w-5xl mx-auto\">"
);

// 6. Replace closing </DashboardLayout> with </div></div>
content = content.replace(
  "        </Dialog>\r\n      </DashboardLayout>\r\n    );\r\n  };",
  "        </Dialog>\r\n      </div>\r\n    </div>\r\n  );\r\n};"
);

// Write back with LF only for consistency
content = content.replace(/\r\n/g, '\n');
fs.writeFileSync('src/pages/EditarOS.tsx', content, 'utf8');
console.log('Done! Checking for remaining DashboardLayout:', content.includes('DashboardLayout'));
