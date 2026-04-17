import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Upload, X, ImageIcon, Loader2, Trash2 } from "lucide-react";

const Perfil = () => {
  const [nomeOficina, setNomeOficina] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [logotipoUrl, setLogotipoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("usuarios").select("*").eq("id", user.id).single();
      if (data) {
        setNomeOficina(data.nome_oficina || "");
        setTelefone(data.telefone || "");
        setCnpj(data.cnpj || "");
        setEmail(data.email || "");
        setEndereco(data.endereco || "");
        setLogotipoUrl(data.logotipo_url || "");
      }
    };
    fetchPerfil();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Arquivo inválido", description: "Por favor, selecione uma imagem.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleRemoveExistingLogo = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Atualizar banco
    const { error } = await supabase.from("usuarios").update({ logotipo_url: null }).eq("id", user.id);
    
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
    } else {
      setLogotipoUrl("");
      toast({ title: "Logotipo removido!" });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let finalLogoUrl = logotipoUrl;

    // 1. Upload do Arquivo se selecionado
    if (selectedFile) {
      setUploading(true);
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/logo_${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from("logos-oficina")
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) {
        toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" });
        setUploading(false);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("logos-oficina").getPublicUrl(fileName);
      finalLogoUrl = publicUrl;
      setUploading(false);
    }

    const { error } = await supabase.from("usuarios").update({
      nome_oficina: nomeOficina.trim(),
      telefone: telefone.trim() || null,
      cnpj: cnpj.trim() || null,
      endereco: endereco.trim() || null,
      logotipo_url: finalLogoUrl,
    }).eq("id", user.id);

    if (error) {
      toast({ title: "Erro ao salvar Perfil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado!" });
      setLogotipoUrl(finalLogoUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    setLoading(false);
  };

  return (
    <DashboardLayout title="Meu Perfil" subtitle="Edite os dados da sua oficina">
      <div className="max-w-lg">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomeOficina">Nome da Oficina *</Label>
              <Input id="nomeOficina" value={nomeOficina} onChange={(e) => setNomeOficina(e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={email} disabled className="bg-secondary/30" />
              <p className="text-[10px] text-muted-foreground italic">O e-mail é usado para login e notificações e não pode ser alterado aqui.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={20} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maxLength={18} placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço da Oficina</Label>
              <Input id="endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, Número, Bairro, Cidade - UF" />
            </div>
            <div className="space-y-3">
              <Label>Logotipo da Oficina</Label>
              <div className="flex flex-col gap-4">
                {/* Preview Area */}
                {(previewUrl || logotipoUrl) ? (
                  <div className="relative w-40 h-40 border rounded-lg overflow-hidden bg-muted/20 flex items-center justify-center group">
                    <img 
                      src={previewUrl || logotipoUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                       {previewUrl ? (
                         <Button type="button" variant="destructive" size="icon" onClick={handleRemovePreview}>
                           <X className="w-4 h-4" />
                         </Button>
                       ) : (
                         <Button type="button" variant="destructive" size="icon" onClick={handleRemoveExistingLogo}>
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       )}
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Sem Logo</span>
                  </div>
                )}

                {/* File Input Wrapper */}
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="logotipo" 
                    className="cursor-pointer flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md transition-colors text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    {logotipoUrl ? "Alterar Imagem" : "Selecionar Imagem"}
                  </Label>
                  <Input 
                    id="logotipo" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  {selectedFile && (
                    <span className="text-xs text-muted-foreground italic truncate max-w-[150px]">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">JPG, PNG ou WebP. Tamanho máximo recomendado: 500kb.</p>
              </div>
            </div>
            <Button type="submit" disabled={loading || uploading}>
              {(loading || uploading) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? "Enviando Imagem..." : "Salvando..."}
                </>
              ) : "Salvar alterações"}
            </Button>
          </form>
      </div>
    </DashboardLayout>
  );
};

export default Perfil;
