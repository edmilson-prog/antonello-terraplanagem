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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      abastecimentos: {
        Row: {
          abastecido_em: string
          created_at: string
          custo_total: number | null
          equipamento_id: string
          horimetro: number
          id: string
          litros: number
          local: string | null
          operador_id: string | null
          preco_litro: number | null
          updated_at: string
        }
        Insert: {
          abastecido_em?: string
          created_at?: string
          custo_total?: number | null
          equipamento_id: string
          horimetro: number
          id?: string
          litros: number
          local?: string | null
          operador_id?: string | null
          preco_litro?: number | null
          updated_at?: string
        }
        Update: {
          abastecido_em?: string
          created_at?: string
          custo_total?: number | null
          equipamento_id?: string
          horimetro?: number
          id?: string
          litros?: number
          local?: string | null
          operador_id?: string | null
          preco_litro?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "abastecimentos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abastecimentos_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
        ]
      }
      apontamentos: {
        Row: {
          created_at: string
          equipamento_id: string
          finalizado_em: string | null
          foto_final_url: string | null
          foto_inicial_url: string | null
          horas_trabalhadas: number | null
          horimetro_final: number | null
          horimetro_inicial: number
          id: string
          iniciado_em: string
          metros_executados: number | null
          modalidade: string | null
          observacao: string | null
          operador_id: string
          os_id: string | null
          pendente_sync: boolean
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipamento_id: string
          finalizado_em?: string | null
          foto_final_url?: string | null
          foto_inicial_url?: string | null
          horas_trabalhadas?: number | null
          horimetro_final?: number | null
          horimetro_inicial: number
          id?: string
          iniciado_em?: string
          metros_executados?: number | null
          modalidade?: string | null
          observacao?: string | null
          operador_id: string
          os_id?: string | null
          pendente_sync?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipamento_id?: string
          finalizado_em?: string | null
          foto_final_url?: string | null
          foto_inicial_url?: string | null
          horas_trabalhadas?: number | null
          horimetro_final?: number | null
          horimetro_inicial?: number
          id?: string
          iniciado_em?: string
          metros_executados?: number | null
          modalidade?: string | null
          observacao?: string | null
          operador_id?: string
          os_id?: string | null
          pendente_sync?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apontamentos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos_whatsapp: {
        Row: {
          cliente_id: string
          created_at: string
          enviado_em: string
          id: string
          mensagem_preview: string
          os_id: string
          provedor: string
          status: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          enviado_em?: string
          id?: string
          mensagem_preview?: string
          os_id: string
          provedor: string
          status: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          enviado_em?: string
          id?: string
          mensagem_preview?: string
          os_id?: string
          provedor?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_whatsapp_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avisos_whatsapp_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean
          created_at: string
          documento: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          documento?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cobrancas_gateway: {
        Row: {
          conta_receber_id: string
          created_at: string
          emitida_em: string
          id: string
          linha_digitavel: string | null
          paga_em: string | null
          pix_copia_cola: string
          provedor: string
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          conta_receber_id: string
          created_at?: string
          emitida_em?: string
          id?: string
          linha_digitavel?: string | null
          paga_em?: string | null
          pix_copia_cola: string
          provedor: string
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          conta_receber_id?: string
          created_at?: string
          emitida_em?: string
          id?: string
          linha_digitavel?: string | null
          paga_em?: string | null
          pix_copia_cola?: string
          provedor?: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "cobrancas_gateway_conta_receber_id_fkey"
            columns: ["conta_receber_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
        ]
      }
      componentes_custo: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          equipamento_id: string
          id: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          equipamento_id: string
          id?: string
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          equipamento_id?: string
          id?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "componentes_custo_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      comprovantes: {
        Row: {
          assinado_em: string | null
          assinante_nome: string | null
          assinatura_url: string | null
          cliente_id: string
          created_at: string
          gerado_em: string
          id: string
          motivo_recusa: string | null
          numero: string
          os_id: string
          resumo_servico: string
          status: string
          updated_at: string
        }
        Insert: {
          assinado_em?: string | null
          assinante_nome?: string | null
          assinatura_url?: string | null
          cliente_id: string
          created_at?: string
          gerado_em?: string
          id?: string
          motivo_recusa?: string | null
          numero: string
          os_id: string
          resumo_servico: string
          status?: string
          updated_at?: string
        }
        Update: {
          assinado_em?: string | null
          assinante_nome?: string | null
          assinatura_url?: string | null
          cliente_id?: string
          created_at?: string
          gerado_em?: string
          id?: string
          motivo_recusa?: string | null
          numero?: string
          os_id?: string
          resumo_servico?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comprovantes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comprovantes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: true
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagar: {
        Row: {
          categoria: string
          created_at: string
          descricao: string
          fornecedor: string | null
          id: string
          pago_em: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao: string
          fornecedor?: string | null
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
          valor: number
          vencimento: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string
          fornecedor?: string | null
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: []
      }
      contas_receber: {
        Row: {
          cliente_id: string
          created_at: string
          faturamento_id: string
          forma_recebimento: string | null
          id: string
          recebido_em: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          faturamento_id: string
          forma_recebimento?: string | null
          id?: string
          recebido_em?: string | null
          status?: string
          updated_at?: string
          valor: number
          vencimento: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          faturamento_id?: string
          forma_recebimento?: string | null
          id?: string
          recebido_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_faturamento_id_fkey"
            columns: ["faturamento_id"]
            isOneToOne: false
            referencedRelation: "faturamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      equipamentos: {
        Row: {
          ativo: boolean
          capacidade: string
          created_at: string
          horimetro_atual: number
          id: string
          identificador: string | null
          nome: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          capacidade: string
          created_at?: string
          horimetro_atual?: number
          id?: string
          identificador?: string | null
          nome: string
          status?: string
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          capacidade?: string
          created_at?: string
          horimetro_atual?: number
          id?: string
          identificador?: string | null
          nome?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      faturamento_itens: {
        Row: {
          descricao: string
          faturamento_id: string
          hora_tipo: string | null
          id: string
          origem_id: string | null
          quantidade: number
          sem_preco: boolean
          tipo: string
          valor_total: number
          valor_unitario: number | null
        }
        Insert: {
          descricao: string
          faturamento_id: string
          hora_tipo?: string | null
          id?: string
          origem_id?: string | null
          quantidade: number
          sem_preco?: boolean
          tipo: string
          valor_total?: number
          valor_unitario?: number | null
        }
        Update: {
          descricao?: string
          faturamento_id?: string
          hora_tipo?: string | null
          id?: string
          origem_id?: string | null
          quantidade?: number
          sem_preco?: boolean
          tipo?: string
          valor_total?: number
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faturamento_itens_faturamento_id_fkey"
            columns: ["faturamento_id"]
            isOneToOne: false
            referencedRelation: "faturamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      faturamentos: {
        Row: {
          cliente_id: string
          created_at: string
          desconto: number
          faturado_em: string | null
          gerado_em: string
          id: string
          modelo_cobranca: string
          numero: string
          observacao: string | null
          os_id: string
          status: string
          updated_at: string
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          desconto?: number
          faturado_em?: string | null
          gerado_em?: string
          id?: string
          modelo_cobranca: string
          numero: string
          observacao?: string | null
          os_id: string
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          desconto?: number
          faturado_em?: string | null
          gerado_em?: string
          id?: string
          modelo_cobranca?: string
          numero?: string
          observacao?: string | null
          os_id?: string
          status?: string
          updated_at?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      operador_sessoes: {
        Row: {
          criado_em: string
          expira_em: string
          operador_id: string
          revogado: boolean
          token: string
        }
        Insert: {
          criado_em?: string
          expira_em: string
          operador_id: string
          revogado?: boolean
          token?: string
        }
        Update: {
          criado_em?: string
          expira_em?: string
          operador_id?: string
          revogado?: boolean
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_operador_sessoes_operador"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
        ]
      }
      operadores: {
        Row: {
          ativo: boolean
          bloqueado_ate: string | null
          cpf: string
          created_at: string
          id: string
          nome: string
          pin_hash: string
          telefone: string | null
          tentativas_falhas: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bloqueado_ate?: string | null
          cpf: string
          created_at?: string
          id?: string
          nome: string
          pin_hash: string
          telefone?: string | null
          tentativas_falhas?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bloqueado_ate?: string | null
          cpf?: string
          created_at?: string
          id?: string
          nome?: string
          pin_hash?: string
          telefone?: string | null
          tentativas_falhas?: number
          updated_at?: string
        }
        Relationships: []
      }
      orcamento_itens: {
        Row: {
          descricao: string
          hora_tipo: string | null
          id: string
          orcamento_id: string
          origem_id: string | null
          quantidade_estimada: number
          sem_preco: boolean
          tipo: string
          valor_total: number
          valor_unitario: number | null
        }
        Insert: {
          descricao: string
          hora_tipo?: string | null
          id?: string
          orcamento_id: string
          origem_id?: string | null
          quantidade_estimada: number
          sem_preco?: boolean
          tipo: string
          valor_total?: number
          valor_unitario?: number | null
        }
        Update: {
          descricao?: string
          hora_tipo?: string | null
          id?: string
          orcamento_id?: string
          origem_id?: string | null
          quantidade_estimada?: number
          sem_preco?: boolean
          tipo?: string
          valor_total?: number
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string
          created_at: string
          decidido_em: string | null
          desconto: number
          descricao_obra: string
          enviado_em: string | null
          id: string
          numero: string
          observacao: string | null
          os_id: string | null
          status: string
          updated_at: string
          validade: string | null
          valor_total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          decidido_em?: string | null
          desconto?: number
          descricao_obra: string
          enviado_em?: string | null
          id?: string
          numero: string
          observacao?: string | null
          os_id?: string | null
          status?: string
          updated_at?: string
          validade?: string | null
          valor_total?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          decidido_em?: string | null
          desconto?: number
          descricao_obra?: string
          enviado_em?: string | null
          id?: string
          numero?: string
          observacao?: string | null
          os_id?: string | null
          status?: string
          updated_at?: string
          validade?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          aberta_em: string
          cliente_id: string
          created_at: string
          diametro_broca_mm: number | null
          endereco: string | null
          fechada_em: string | null
          id: string
          modelo_cobranca: string
          numero: string
          obra_nome: string
          observacao: string | null
          pendente_sync: boolean
          responsavel_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          aberta_em?: string
          cliente_id: string
          created_at?: string
          diametro_broca_mm?: number | null
          endereco?: string | null
          fechada_em?: string | null
          id?: string
          modelo_cobranca: string
          numero: string
          obra_nome: string
          observacao?: string | null
          pendente_sync?: boolean
          responsavel_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          aberta_em?: string
          cliente_id?: string
          created_at?: string
          diametro_broca_mm?: number | null
          endereco?: string | null
          fechada_em?: string | null
          id?: string
          modelo_cobranca?: string
          numero?: string
          obra_nome?: string
          observacao?: string | null
          pendente_sync?: boolean
          responsavel_id?: string | null
          status?: string
          updated_at?: string
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
            foreignKeyName: "ordens_servico_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_manutencao: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          equipamento_id: string | null
          id: string
          intervalo_horas: number
          tipo_equipamento: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          equipamento_id?: string | null
          id?: string
          intervalo_horas: number
          tipo_equipamento?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          equipamento_id?: string | null
          id?: string
          intervalo_horas?: number
          tipo_equipamento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planos_manutencao_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      precos_fundacao: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          diametro_broca_mm: number
          id: string
          updated_at: string
          valor_metro: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          diametro_broca_mm: number
          id?: string
          updated_at?: string
          valor_metro: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          diametro_broca_mm?: number
          id?: string
          updated_at?: string
          valor_metro?: number
        }
        Relationships: []
      }
      precos_hora_maquina: {
        Row: {
          ativo: boolean
          created_at: string
          equipamento_id: string | null
          id: string
          tipo_equipamento: string | null
          updated_at: string
          valor_hora_operada: number
          valor_hora_seca: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          equipamento_id?: string | null
          id?: string
          tipo_equipamento?: string | null
          updated_at?: string
          valor_hora_operada: number
          valor_hora_seca: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          equipamento_id?: string | null
          id?: string
          tipo_equipamento?: string | null
          updated_at?: string
          valor_hora_operada?: number
          valor_hora_seca?: number
        }
        Relationships: [
          {
            foreignKeyName: "precos_hora_maquina_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      precos_mobilizacao: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string
          id: string
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao: string
          id?: string
          updated_at?: string
          valor: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string
          id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      registros_manutencao: {
        Row: {
          created_at: string
          custo: number | null
          equipamento_id: string
          horimetro_previsto: number
          horimetro_realizado: number | null
          id: string
          observacao: string | null
          plano_id: string
          realizada_em: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custo?: number | null
          equipamento_id: string
          horimetro_previsto: number
          horimetro_realizado?: number | null
          id?: string
          observacao?: string | null
          plano_id: string
          realizada_em?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custo?: number | null
          equipamento_id?: string
          horimetro_previsto?: number
          horimetro_realizado?: number | null
          id?: string
          observacao?: string | null
          plano_id?: string
          realizada_em?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_manutencao_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_manutencao_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_manutencao"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_retaguarda: {
        Row: {
          created_at: string
          id: string
          nome: string
          perfil: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome: string
          perfil: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          perfil?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_retaguarda: { Args: never; Returns: boolean }
      login_operador: {
        Args: { p_operador_id: string; p_pin: string }
        Returns: Json
      }
      logout_operador: { Args: { p_token: string }; Returns: undefined }
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
