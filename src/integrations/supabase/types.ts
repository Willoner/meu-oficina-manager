export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
          usuario_id: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          usuario_id: string
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          created_at: string | null
          formato_data: string | null
          id: string
          moeda: string | null
          notificacoes_email: boolean | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          formato_data?: string | null
          id?: string
          moeda?: string | null
          notificacoes_email?: boolean | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          formato_data?: string | null
          id?: string
          moeda?: string | null
          notificacoes_email?: boolean | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_os: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          ordem_servico_id: string
          quantidade: number | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          ordem_servico_id: string
          quantidade?: number | null
          tipo: string
          valor_total: number
          valor_unitario: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          ordem_servico_id?: string
          quantidade?: number | null
          tipo?: string
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_os_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          assinatura_cliente_aceito: boolean | null
          assinatura_cliente_em: string | null
          assinatura_mecanico_aceito: boolean | null
          assinatura_mecanico_em: string | null
          cliente_id: string
          created_at: string | null
          data_abertura: string | null
          data_conclusao: string | null
          id: string
          observacoes: string | null
          status: string | null
          tipo_servico: string | null
          usuario_id: string
          valor_total: number | null
          veiculo_id: string
        }
        Insert: {
          assinatura_cliente_aceito?: boolean | null
          assinatura_cliente_em?: string | null
          assinatura_mecanico_aceito?: boolean | null
          assinatura_mecanico_em?: string | null
          cliente_id: string
          created_at?: string | null
          data_abertura?: string | null
          data_conclusao?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          tipo_servico?: string | null
          usuario_id: string
          valor_total?: number | null
          veiculo_id: string
        }
        Update: {
          assinatura_cliente_aceito?: boolean | null
          assinatura_cliente_em?: string | null
          assinatura_mecanico_aceito?: boolean | null
          assinatura_mecanico_em?: string | null
          cliente_id?: string
          created_at?: string | null
          data_abertura?: string | null
          data_conclusao?: string | null
          id?: string
          observacoes?: string | null
          status?: string | null
          tipo_servico?: string | null
          usuario_id?: string
          valor_total?: number | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string | null
          data_pagamento: string | null
          forma_pagamento: string
          id: string
          ordem_servico_id: string
          status: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_pagamento?: string | null
          forma_pagamento: string
          id?: string
          ordem_servico_id: string
          status?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data_pagamento?: string | null
          forma_pagamento?: string
          id?: string
          ordem_servico_id?: string
          status?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      pecas: {
        Row: {
          codigo: string | null
          created_at: string | null
          estoque: number | null
          id: string
          nome: string
          usuario_id: string
          valor_venda: number | null
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          estoque?: number | null
          id?: string
          nome: string
          usuario_id: string
          valor_venda?: number | null
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          estoque?: number | null
          id?: string
          nome?: string
          usuario_id?: string
          valor_venda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pecas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tempo_estimado: number | null
          usuario_id: string
          valor_padrao: number | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tempo_estimado?: number | null
          usuario_id: string
          valor_padrao?: number | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tempo_estimado?: number | null
          usuario_id?: string
          valor_padrao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          cnpj: string | null
          created_at: string | null
          email: string
          endereco: string | null
          id: string
          logotipo_url: string | null
          nome_oficina: string
          plano: string | null
          telefone: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string | null
          email: string
          endereco?: string | null
          id?: string
          logotipo_url?: string | null
          nome_oficina: string
          plano?: string | null
          telefone?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string | null
          email?: string
          endereco?: string | null
          id?: string
          logotipo_url?: string | null
          nome_oficina?: string
          plano?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          cliente_id: string
          created_at: string | null
          id: string
          km_atual: number | null
          marca: string
          modelo: string
          placa: string
          usuario_id: string
        }
        Insert: {
          ano?: number | null
          cliente_id: string
          created_at?: string | null
          id?: string
          km_atual?: number | null
          marca: string
          modelo: string
          placa: string
          usuario_id: string
        }
        Update: {
          ano?: number | null
          cliente_id?: string
          created_at?: string | null
          id?: string
          km_atual?: number | null
          marca?: string
          modelo?: string
          placa?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
