export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      abastecimentos: {
        Row: {
          abastecido_em: string;
          created_at: string;
          custo_total: number | null;
          equipamento_id: string;
          horimetro: number;
          id: string;
          litros: number;
          local: string | null;
          operador_id: string | null;
          origem: string;
          preco_litro: number | null;
          updated_at: string;
        };
        Insert: {
          abastecido_em?: string;
          created_at?: string;
          custo_total?: number | null;
          equipamento_id: string;
          horimetro: number;
          id?: string;
          litros: number;
          local?: string | null;
          operador_id?: string | null;
          origem?: string;
          preco_litro?: number | null;
          updated_at?: string;
        };
        Update: {
          abastecido_em?: string;
          created_at?: string;
          custo_total?: number | null;
          equipamento_id?: string;
          horimetro?: number;
          id?: string;
          litros?: number;
          local?: string | null;
          operador_id?: string | null;
          origem?: string;
          preco_litro?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "abastecimentos_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "abastecimentos_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
        ];
      };
      apontamentos: {
        Row: {
          created_at: string;
          equipamento_id: string;
          finalizado_em: string | null;
          foto_final_url: string | null;
          foto_inicial_url: string | null;
          horas_trabalhadas: number | null;
          horimetro_final: number | null;
          horimetro_inicial: number;
          id: string;
          iniciado_em: string;
          metros_executados: number | null;
          modalidade: string | null;
          observacao: string | null;
          operador_id: string;
          os_id: string | null;
          pendente_sync: boolean;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          equipamento_id: string;
          finalizado_em?: string | null;
          foto_final_url?: string | null;
          foto_inicial_url?: string | null;
          horas_trabalhadas?: number | null;
          horimetro_final?: number | null;
          horimetro_inicial: number;
          id?: string;
          iniciado_em?: string;
          metros_executados?: number | null;
          modalidade?: string | null;
          observacao?: string | null;
          operador_id: string;
          os_id?: string | null;
          pendente_sync?: boolean;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          equipamento_id?: string;
          finalizado_em?: string | null;
          foto_final_url?: string | null;
          foto_inicial_url?: string | null;
          horas_trabalhadas?: number | null;
          horimetro_final?: number | null;
          horimetro_inicial?: number;
          id?: string;
          iniciado_em?: string;
          metros_executados?: number | null;
          modalidade?: string | null;
          observacao?: string | null;
          operador_id?: string;
          os_id?: string | null;
          pendente_sync?: boolean;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "apontamentos_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "apontamentos_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "apontamentos_os_id_fkey";
            columns: ["os_id"];
            isOneToOne: false;
            referencedRelation: "ordens_servico";
            referencedColumns: ["id"];
          },
        ];
      };
      avisos_whatsapp: {
        Row: {
          cliente_id: string;
          created_at: string;
          enviado_em: string;
          id: string;
          mensagem_preview: string;
          os_id: string;
          provedor: string;
          status: string;
        };
        Insert: {
          cliente_id: string;
          created_at?: string;
          enviado_em?: string;
          id?: string;
          mensagem_preview?: string;
          os_id: string;
          provedor: string;
          status: string;
        };
        Update: {
          cliente_id?: string;
          created_at?: string;
          enviado_em?: string;
          id?: string;
          mensagem_preview?: string;
          os_id?: string;
          provedor?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "avisos_whatsapp_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avisos_whatsapp_os_id_fkey";
            columns: ["os_id"];
            isOneToOne: true;
            referencedRelation: "ordens_servico";
            referencedColumns: ["id"];
          },
        ];
      };
      clientes: {
        Row: {
          ativo: boolean;
          nome_fantasia: string | null;
          segmento: string | null;
          email: string | null;
          endereco: string | null;
          cidade: string | null;
          contato_nome: string | null;
          contato_papel: string | null;
          legado_importado_em: string | null;
          cli_codigo_legado: number | null;
          created_at: string;
          documento: string | null;
          id: string;
          legado_curva_abc: string | null;
          legado_frequencia_os: number | null;
          legado_ltv: number | null;
          legado_primeira_os: string | null;
          legado_recencia_dias: number | null;
          legado_ticket_medio: number | null;
          legado_ultima_os: string | null;
          nome: string;
          telefone: string | null;
          tipo_pessoa: string | null;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          nome_fantasia?: string | null;
          segmento?: string | null;
          email?: string | null;
          endereco?: string | null;
          cidade?: string | null;
          contato_nome?: string | null;
          contato_papel?: string | null;
          legado_importado_em?: string | null;
          cli_codigo_legado?: number | null;
          created_at?: string;
          documento?: string | null;
          id?: string;
          legado_curva_abc?: string | null;
          legado_frequencia_os?: number | null;
          legado_ltv?: number | null;
          legado_primeira_os?: string | null;
          legado_recencia_dias?: number | null;
          legado_ticket_medio?: number | null;
          legado_ultima_os?: string | null;
          nome: string;
          telefone?: string | null;
          tipo_pessoa?: string | null;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          nome_fantasia?: string | null;
          segmento?: string | null;
          email?: string | null;
          endereco?: string | null;
          cidade?: string | null;
          contato_nome?: string | null;
          contato_papel?: string | null;
          legado_importado_em?: string | null;
          cli_codigo_legado?: number | null;
          created_at?: string;
          documento?: string | null;
          id?: string;
          legado_curva_abc?: string | null;
          legado_frequencia_os?: number | null;
          legado_ltv?: number | null;
          legado_primeira_os?: string | null;
          legado_recencia_dias?: number | null;
          legado_ticket_medio?: number | null;
          legado_ultima_os?: string | null;
          nome?: string;
          telefone?: string | null;
          tipo_pessoa?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cobrancas_gateway: {
        Row: {
          conta_receber_id: string;
          created_at: string;
          emitida_em: string;
          id: string;
          linha_digitavel: string | null;
          paga_em: string | null;
          pix_copia_cola: string;
          provedor: string;
          status: string;
          updated_at: string;
          valor: number;
        };
        Insert: {
          conta_receber_id: string;
          created_at?: string;
          emitida_em?: string;
          id?: string;
          linha_digitavel?: string | null;
          paga_em?: string | null;
          pix_copia_cola: string;
          provedor: string;
          status?: string;
          updated_at?: string;
          valor: number;
        };
        Update: {
          conta_receber_id?: string;
          created_at?: string;
          emitida_em?: string;
          id?: string;
          linha_digitavel?: string | null;
          paga_em?: string | null;
          pix_copia_cola?: string;
          provedor?: string;
          status?: string;
          updated_at?: string;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cobrancas_gateway_conta_receber_id_fkey";
            columns: ["conta_receber_id"];
            isOneToOne: false;
            referencedRelation: "contas_receber";
            referencedColumns: ["id"];
          },
        ];
      };
      componentes_custo: {
        Row: {
          ativo: boolean;
          created_at: string;
          descricao: string;
          equipamento_id: string;
          id: string;
          tipo: string;
          updated_at: string;
          valor: number;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          descricao: string;
          equipamento_id: string;
          id?: string;
          tipo: string;
          updated_at?: string;
          valor: number;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          descricao?: string;
          equipamento_id?: string;
          id?: string;
          tipo?: string;
          updated_at?: string;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "componentes_custo_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
        ];
      };
      compras_diesel: {
        Row: {
          comprado_em: string;
          conta_pagar_id: string | null;
          created_at: string;
          documento: string | null;
          fornecedor: string | null;
          id: string;
          litros: number;
          observacao: string | null;
          preco_litro: number;
          updated_at: string;
          valor_total: number;
        };
        Insert: {
          comprado_em?: string;
          conta_pagar_id?: string | null;
          created_at?: string;
          documento?: string | null;
          fornecedor?: string | null;
          id?: string;
          litros: number;
          observacao?: string | null;
          preco_litro: number;
          updated_at?: string;
          valor_total: number;
        };
        Update: {
          comprado_em?: string;
          conta_pagar_id?: string | null;
          created_at?: string;
          documento?: string | null;
          fornecedor?: string | null;
          id?: string;
          litros?: number;
          observacao?: string | null;
          preco_litro?: number;
          updated_at?: string;
          valor_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "compras_diesel_conta_pagar_id_fkey";
            columns: ["conta_pagar_id"];
            isOneToOne: false;
            referencedRelation: "contas_pagar";
            referencedColumns: ["id"];
          },
        ];
      };
      comprovantes: {
        Row: {
          assinado_em: string | null;
          assinante_nome: string | null;
          assinatura_url: string | null;
          cliente_id: string;
          created_at: string;
          gerado_em: string;
          id: string;
          motivo_recusa: string | null;
          numero: string;
          os_id: string;
          resumo_servico: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          assinado_em?: string | null;
          assinante_nome?: string | null;
          assinatura_url?: string | null;
          cliente_id: string;
          created_at?: string;
          gerado_em?: string;
          id?: string;
          motivo_recusa?: string | null;
          numero: string;
          os_id: string;
          resumo_servico: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          assinado_em?: string | null;
          assinante_nome?: string | null;
          assinatura_url?: string | null;
          cliente_id?: string;
          created_at?: string;
          gerado_em?: string;
          id?: string;
          motivo_recusa?: string | null;
          numero?: string;
          os_id?: string;
          resumo_servico?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comprovantes_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comprovantes_os_id_fkey";
            columns: ["os_id"];
            isOneToOne: true;
            referencedRelation: "ordens_servico";
            referencedColumns: ["id"];
          },
        ];
      };
      contas_pagar: {
        Row: {
          categoria: string;
          created_at: string;
          descricao: string;
          documento: string | null;
          forma_pagamento: string | null;
          fornecedor: string | null;
          id: string;
          observacao: string | null;
          pago_em: string | null;
          status: string;
          updated_at: string;
          valor: number;
          vencimento: string;
        };
        Insert: {
          categoria: string;
          created_at?: string;
          descricao: string;
          documento?: string | null;
          forma_pagamento?: string | null;
          fornecedor?: string | null;
          id?: string;
          observacao?: string | null;
          pago_em?: string | null;
          status?: string;
          updated_at?: string;
          valor: number;
          vencimento: string;
        };
        Update: {
          categoria?: string;
          created_at?: string;
          descricao?: string;
          documento?: string | null;
          forma_pagamento?: string | null;
          fornecedor?: string | null;
          id?: string;
          observacao?: string | null;
          pago_em?: string | null;
          status?: string;
          updated_at?: string;
          valor?: number;
          vencimento?: string;
        };
        Relationships: [];
      };
      contas_receber: {
        Row: {
          cliente_id: string;
          created_at: string;
          faturamento_id: string;
          forma_recebimento: string | null;
          id: string;
          recebido_em: string | null;
          status: string;
          updated_at: string;
          valor: number;
          vencimento: string;
        };
        Insert: {
          cliente_id: string;
          created_at?: string;
          faturamento_id: string;
          forma_recebimento?: string | null;
          id?: string;
          recebido_em?: string | null;
          status?: string;
          updated_at?: string;
          valor: number;
          vencimento: string;
        };
        Update: {
          cliente_id?: string;
          created_at?: string;
          faturamento_id?: string;
          forma_recebimento?: string | null;
          id?: string;
          recebido_em?: string | null;
          status?: string;
          updated_at?: string;
          valor?: number;
          vencimento?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contas_receber_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contas_receber_faturamento_id_fkey";
            columns: ["faturamento_id"];
            isOneToOne: false;
            referencedRelation: "faturamentos";
            referencedColumns: ["id"];
          },
        ];
      };
      equipamentos: {
        Row: {
          ano: string | null;
          aquisicao_forma: string | null;
          aquisicao_parcelas: number | null;
          descricao: string | null;
          ativo: boolean;
          capacidade: string;
          created_at: string;
          horimetro_atual: number;
          id: string;
          identificador: string | null;
          marca: string | null;
          nome: string;
          propriedade: string | null;
          status: string;
          tipo: string;
          updated_at: string;
        };
        Insert: {
          ano?: string | null;
          aquisicao_forma?: string | null;
          aquisicao_parcelas?: number | null;
          descricao?: string | null;
          ativo?: boolean;
          capacidade: string;
          created_at?: string;
          horimetro_atual?: number;
          id?: string;
          identificador?: string | null;
          marca?: string | null;
          nome: string;
          propriedade?: string | null;
          status?: string;
          tipo: string;
          updated_at?: string;
        };
        Update: {
          ano?: string | null;
          aquisicao_forma?: string | null;
          aquisicao_parcelas?: number | null;
          descricao?: string | null;
          ativo?: boolean;
          capacidade?: string;
          created_at?: string;
          horimetro_atual?: number;
          id?: string;
          identificador?: string | null;
          marca?: string | null;
          nome?: string;
          propriedade?: string | null;
          status?: string;
          tipo?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faturamento_itens: {
        Row: {
          descricao: string;
          faturamento_id: string;
          hora_tipo: string | null;
          id: string;
          origem_id: string | null;
          quantidade: number;
          sem_preco: boolean;
          tipo: string;
          valor_total: number;
          valor_unitario: number | null;
        };
        Insert: {
          descricao: string;
          faturamento_id: string;
          hora_tipo?: string | null;
          id?: string;
          origem_id?: string | null;
          quantidade: number;
          sem_preco?: boolean;
          tipo: string;
          valor_total?: number;
          valor_unitario?: number | null;
        };
        Update: {
          descricao?: string;
          faturamento_id?: string;
          hora_tipo?: string | null;
          id?: string;
          origem_id?: string | null;
          quantidade?: number;
          sem_preco?: boolean;
          tipo?: string;
          valor_total?: number;
          valor_unitario?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "faturamento_itens_faturamento_id_fkey";
            columns: ["faturamento_id"];
            isOneToOne: false;
            referencedRelation: "faturamentos";
            referencedColumns: ["id"];
          },
        ];
      };
      faturamentos: {
        Row: {
          cliente_id: string;
          created_at: string;
          desconto: number;
          faturado_em: string | null;
          gerado_em: string;
          id: string;
          modelo_cobranca: string;
          numero: string;
          observacao: string | null;
          os_id: string;
          status: string;
          updated_at: string;
          valor_total: number;
        };
        Insert: {
          cliente_id: string;
          created_at?: string;
          desconto?: number;
          faturado_em?: string | null;
          gerado_em?: string;
          id?: string;
          modelo_cobranca: string;
          numero: string;
          observacao?: string | null;
          os_id: string;
          status?: string;
          updated_at?: string;
          valor_total?: number;
        };
        Update: {
          cliente_id?: string;
          created_at?: string;
          desconto?: number;
          faturado_em?: string | null;
          gerado_em?: string;
          id?: string;
          modelo_cobranca?: string;
          numero?: string;
          observacao?: string | null;
          os_id?: string;
          status?: string;
          updated_at?: string;
          valor_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "faturamentos_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "faturamentos_os_id_fkey";
            columns: ["os_id"];
            isOneToOne: false;
            referencedRelation: "ordens_servico";
            referencedColumns: ["id"];
          },
        ];
      };
      notificacoes: {
        Row: {
          acao: string | null;
          agendada_para: string | null;
          canais: string[] | null;
          categoria: string;
          created_at: string;
          enviada_em: string | null;
          id: string;
          lida_em: string | null;
          mensagem: string;
          operador_id: string | null;
          origem_id: string | null;
          os_id: string | null;
          prioridade: string;
          tipo: string;
          titulo: string;
          updated_at: string;
          usuario_id: string | null;
        };
        Insert: {
          acao?: string | null;
          agendada_para?: string | null;
          canais?: string[] | null;
          categoria?: string;
          created_at?: string;
          enviada_em?: string | null;
          id?: string;
          lida_em?: string | null;
          mensagem: string;
          operador_id?: string | null;
          origem_id?: string | null;
          os_id?: string | null;
          prioridade?: string;
          tipo: string;
          titulo: string;
          updated_at?: string;
          usuario_id?: string | null;
        };
        Update: {
          acao?: string | null;
          agendada_para?: string | null;
          canais?: string[] | null;
          categoria?: string;
          created_at?: string;
          enviada_em?: string | null;
          id?: string;
          lida_em?: string | null;
          mensagem?: string;
          operador_id?: string | null;
          origem_id?: string | null;
          os_id?: string | null;
          prioridade?: string;
          tipo?: string;
          titulo?: string;
          updated_at?: string;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notificacoes_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notificacoes_os_id_fkey";
            columns: ["os_id"];
            isOneToOne: false;
            referencedRelation: "ordens_servico";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notificacoes_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "usuarios_retaguarda";
            referencedColumns: ["id"];
          },
        ];
      };
      notificacoes_entregas: {
        Row: {
          aberta_em: string | null;
          canal: string;
          created_at: string;
          destino: string | null;
          entregue_em: string | null;
          id: string;
          motivo: string | null;
          notificacao_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          aberta_em?: string | null;
          canal: string;
          created_at?: string;
          destino?: string | null;
          entregue_em?: string | null;
          id?: string;
          motivo?: string | null;
          notificacao_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          aberta_em?: string | null;
          canal?: string;
          created_at?: string;
          destino?: string | null;
          entregue_em?: string | null;
          id?: string;
          motivo?: string | null;
          notificacao_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notificacoes_entregas_notificacao_id_fkey";
            columns: ["notificacao_id"];
            isOneToOne: false;
            referencedRelation: "notificacoes";
            referencedColumns: ["id"];
          },
        ];
      };
      notificacoes_preferencias: {
        Row: {
          atualizado_por: string | null;
          created_at: string;
          fim_de_semana_so_criticos: boolean;
          id: string;
          max_push_por_hora: number;
          resumo_email_ativo: boolean;
          resumo_email_hora: string;
          retencao_dias: number;
          silencio_fim: string;
          silencio_inicio: string;
          updated_at: string;
        };
        Insert: {
          atualizado_por?: string | null;
          created_at?: string;
          fim_de_semana_so_criticos?: boolean;
          id?: string;
          max_push_por_hora?: number;
          resumo_email_ativo?: boolean;
          resumo_email_hora?: string;
          retencao_dias?: number;
          silencio_fim?: string;
          silencio_inicio?: string;
          updated_at?: string;
        };
        Update: {
          atualizado_por?: string | null;
          created_at?: string;
          fim_de_semana_so_criticos?: boolean;
          id?: string;
          max_push_por_hora?: number;
          resumo_email_ativo?: boolean;
          resumo_email_hora?: string;
          retencao_dias?: number;
          silencio_fim?: string;
          silencio_inicio?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notificacoes_preferencias_atualizado_por_fkey";
            columns: ["atualizado_por"];
            isOneToOne: false;
            referencedRelation: "usuarios_retaguarda";
            referencedColumns: ["id"];
          },
        ];
      };
      notificacoes_preferencias_eventos: {
        Row: {
          canal_app: boolean;
          canal_email: boolean;
          canal_push: boolean;
          canal_whatsapp: boolean;
          created_at: string;
          critico: boolean;
          tipo: string;
          updated_at: string;
        };
        Insert: {
          canal_app?: boolean;
          canal_email?: boolean;
          canal_push?: boolean;
          canal_whatsapp?: boolean;
          created_at?: string;
          critico?: boolean;
          tipo: string;
          updated_at?: string;
        };
        Update: {
          canal_app?: boolean;
          canal_email?: boolean;
          canal_push?: boolean;
          canal_whatsapp?: boolean;
          created_at?: string;
          critico?: boolean;
          tipo?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      operador_sessoes: {
        Row: {
          app_versao: string | null;
          criado_em: string;
          dispositivo: string | null;
          expira_em: string;
          operador_id: string;
          revogado: boolean;
          token: string;
          ultimo_uso_em: string | null;
        };
        Insert: {
          app_versao?: string | null;
          criado_em?: string;
          dispositivo?: string | null;
          expira_em: string;
          operador_id: string;
          revogado?: boolean;
          token?: string;
          ultimo_uso_em?: string | null;
        };
        Update: {
          app_versao?: string | null;
          criado_em?: string;
          dispositivo?: string | null;
          expira_em?: string;
          operador_id?: string;
          revogado?: boolean;
          token?: string;
          ultimo_uso_em?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_operador_sessoes_operador";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
        ];
      };
      operadores: {
        Row: {
          admissao: string | null;
          ativo: boolean;
          base: string | null;
          bloqueado_ate: string | null;
          cnh_categoria: string | null;
          cnh_validade: string | null;
          cpf: string;
          created_at: string;
          data_nascimento: string | null;
          id: string;
          nome: string;
          pin_hash: string;
          telefone: string | null;
          tentativas_falhas: number;
          updated_at: string;
          vinculo: string | null;
        };
        Insert: {
          admissao?: string | null;
          ativo?: boolean;
          base?: string | null;
          bloqueado_ate?: string | null;
          cnh_categoria?: string | null;
          cnh_validade?: string | null;
          cpf: string;
          created_at?: string;
          data_nascimento?: string | null;
          id?: string;
          nome: string;
          pin_hash: string;
          telefone?: string | null;
          tentativas_falhas?: number;
          updated_at?: string;
          vinculo?: string | null;
        };
        Update: {
          admissao?: string | null;
          ativo?: boolean;
          base?: string | null;
          bloqueado_ate?: string | null;
          cnh_categoria?: string | null;
          cnh_validade?: string | null;
          cpf?: string;
          created_at?: string;
          data_nascimento?: string | null;
          id?: string;
          nome?: string;
          pin_hash?: string;
          telefone?: string | null;
          tentativas_falhas?: number;
          updated_at?: string;
          vinculo?: string | null;
        };
        Relationships: [];
      };
      operadores_equipamentos: {
        Row: {
          created_at: string;
          equipamento_id: string;
          operador_id: string;
        };
        Insert: {
          created_at?: string;
          equipamento_id: string;
          operador_id: string;
        };
        Update: {
          created_at?: string;
          equipamento_id?: string;
          operador_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "operadores_equipamentos_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "operadores_equipamentos_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
        ];
      };
      orcamento_itens: {
        Row: {
          descricao: string;
          hora_tipo: string | null;
          id: string;
          orcamento_id: string;
          origem_id: string | null;
          quantidade_estimada: number;
          sem_preco: boolean;
          tipo: string;
          valor_total: number;
          valor_unitario: number | null;
        };
        Insert: {
          descricao: string;
          hora_tipo?: string | null;
          id?: string;
          orcamento_id: string;
          origem_id?: string | null;
          quantidade_estimada: number;
          sem_preco?: boolean;
          tipo: string;
          valor_total?: number;
          valor_unitario?: number | null;
        };
        Update: {
          descricao?: string;
          hora_tipo?: string | null;
          id?: string;
          orcamento_id?: string;
          origem_id?: string | null;
          quantidade_estimada?: number;
          sem_preco?: boolean;
          tipo?: string;
          valor_total?: number;
          valor_unitario?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey";
            columns: ["orcamento_id"];
            isOneToOne: false;
            referencedRelation: "orcamentos";
            referencedColumns: ["id"];
          },
        ];
      };
      orcamentos: {
        Row: {
          cliente_id: string;
          created_at: string;
          decidido_em: string | null;
          desconto: number;
          descricao_obra: string;
          enviado_em: string | null;
          id: string;
          numero: string;
          observacao: string | null;
          os_id: string | null;
          status: string;
          updated_at: string;
          validade: string | null;
          valor_total: number;
        };
        Insert: {
          cliente_id: string;
          created_at?: string;
          decidido_em?: string | null;
          desconto?: number;
          descricao_obra: string;
          enviado_em?: string | null;
          id?: string;
          numero: string;
          observacao?: string | null;
          os_id?: string | null;
          status?: string;
          updated_at?: string;
          validade?: string | null;
          valor_total?: number;
        };
        Update: {
          cliente_id?: string;
          created_at?: string;
          decidido_em?: string | null;
          desconto?: number;
          descricao_obra?: string;
          enviado_em?: string | null;
          id?: string;
          numero?: string;
          observacao?: string | null;
          os_id?: string | null;
          status?: string;
          updated_at?: string;
          validade?: string | null;
          valor_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orcamentos_os_id_fkey";
            columns: ["os_id"];
            isOneToOne: false;
            referencedRelation: "ordens_servico";
            referencedColumns: ["id"];
          },
        ];
      };
      ordens_servico: {
        Row: {
          aberta_em: string;
          cliente_id: string;
          created_at: string;
          diametro_broca_mm: number | null;
          endereco: string | null;
          equipamento_previsto_id: string | null;
          fechada_em: string | null;
          id: string;
          inicio_previsto: string | null;
          modelo_cobranca: string;
          numero: string;
          obra_nome: string;
          observacao: string | null;
          pendente_sync: boolean;
          responsavel_id: string | null;
          status: string;
          tipo_servico: string | null;
          updated_at: string;
        };
        Insert: {
          aberta_em?: string;
          cliente_id: string;
          created_at?: string;
          diametro_broca_mm?: number | null;
          endereco?: string | null;
          equipamento_previsto_id?: string | null;
          fechada_em?: string | null;
          id?: string;
          inicio_previsto?: string | null;
          modelo_cobranca: string;
          numero: string;
          obra_nome: string;
          observacao?: string | null;
          pendente_sync?: boolean;
          responsavel_id?: string | null;
          status?: string;
          tipo_servico?: string | null;
          updated_at?: string;
        };
        Update: {
          aberta_em?: string;
          cliente_id?: string;
          created_at?: string;
          diametro_broca_mm?: number | null;
          endereco?: string | null;
          equipamento_previsto_id?: string | null;
          fechada_em?: string | null;
          id?: string;
          inicio_previsto?: string | null;
          modelo_cobranca?: string;
          numero?: string;
          obra_nome?: string;
          observacao?: string | null;
          pendente_sync?: boolean;
          responsavel_id?: string | null;
          status?: string;
          tipo_servico?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey";
            columns: ["cliente_id"];
            isOneToOne: false;
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ordens_servico_equipamento_previsto_id_fkey";
            columns: ["equipamento_previsto_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ordens_servico_responsavel_id_fkey";
            columns: ["responsavel_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
        ];
      };
      parametros: {
        Row: {
          alerta_manutencao_horas: number;
          alertar_margem_baixa: boolean;
          apontamento_via_app: boolean;
          aprovacao_apontamento: string;
          arredondamento_preco: string;
          atualizado_por: string | null;
          backup_diario: boolean;
          canal_whatsapp_ativo: boolean;
          chave_pix: string;
          cnpj: string;
          created_at: string;
          custo_operador_hora: number;
          depreciacao_anual_pct: number;
          dias_uteis: string;
          diesel_preco_litro: number;
          dupla_verificacao: boolean;
          email: string;
          email_remetente: string;
          fechamento_dia: string;
          foto_obrigatoria: boolean;
          horas_mes_referencia: number;
          id: string;
          inscricao_estadual: string;
          jornada_horas: number;
          juros_mes_pct: number;
          margem_minima_pct: number;
          multa_atraso_pct: number;
          nf_envio_email: boolean;
          nf_numeracao_automatica: boolean;
          nf_proxima_numeracao: string;
          nf_serie: string;
          nome_fantasia: string;
          particionamento_financeiro: boolean;
          perfil_padrao_novo_usuario: string;
          politica_senha: string;
          razao_social: string;
          reajuste_automatico_precos: boolean;
          recebimento_padrao: string;
          regime_tributario: string;
          registrar_gps: boolean;
          retencao_logs_dias: number;
          sede: string;
          sessao_expira_min: number;
          sincronizacao_app: string;
          tanque_capacidade_litros: number;
          telefone: string;
          tolerancia_horimetro: number;
          updated_at: string;
          vencimento_dias: number;
          versao: number;
          webhook_url: string;
          whatsapp_numero: string;
        };
        Insert: {
          alerta_manutencao_horas?: number;
          alertar_margem_baixa?: boolean;
          apontamento_via_app?: boolean;
          aprovacao_apontamento?: string;
          arredondamento_preco?: string;
          atualizado_por?: string | null;
          backup_diario?: boolean;
          canal_whatsapp_ativo?: boolean;
          chave_pix?: string;
          cnpj?: string;
          created_at?: string;
          custo_operador_hora?: number;
          depreciacao_anual_pct?: number;
          dias_uteis?: string;
          diesel_preco_litro?: number;
          dupla_verificacao?: boolean;
          email?: string;
          email_remetente?: string;
          fechamento_dia?: string;
          foto_obrigatoria?: boolean;
          horas_mes_referencia?: number;
          id?: string;
          inscricao_estadual?: string;
          jornada_horas?: number;
          juros_mes_pct?: number;
          margem_minima_pct?: number;
          multa_atraso_pct?: number;
          nf_envio_email?: boolean;
          nf_numeracao_automatica?: boolean;
          nf_proxima_numeracao?: string;
          nf_serie?: string;
          nome_fantasia?: string;
          particionamento_financeiro?: boolean;
          perfil_padrao_novo_usuario?: string;
          politica_senha?: string;
          razao_social?: string;
          reajuste_automatico_precos?: boolean;
          recebimento_padrao?: string;
          regime_tributario?: string;
          registrar_gps?: boolean;
          retencao_logs_dias?: number;
          sede?: string;
          sessao_expira_min?: number;
          sincronizacao_app?: string;
          tanque_capacidade_litros?: number;
          telefone?: string;
          tolerancia_horimetro?: number;
          updated_at?: string;
          vencimento_dias?: number;
          versao?: number;
          webhook_url?: string;
          whatsapp_numero?: string;
        };
        Update: {
          alerta_manutencao_horas?: number;
          alertar_margem_baixa?: boolean;
          apontamento_via_app?: boolean;
          aprovacao_apontamento?: string;
          arredondamento_preco?: string;
          atualizado_por?: string | null;
          backup_diario?: boolean;
          canal_whatsapp_ativo?: boolean;
          chave_pix?: string;
          cnpj?: string;
          created_at?: string;
          custo_operador_hora?: number;
          depreciacao_anual_pct?: number;
          dias_uteis?: string;
          diesel_preco_litro?: number;
          dupla_verificacao?: boolean;
          email?: string;
          email_remetente?: string;
          fechamento_dia?: string;
          foto_obrigatoria?: boolean;
          horas_mes_referencia?: number;
          id?: string;
          inscricao_estadual?: string;
          jornada_horas?: number;
          juros_mes_pct?: number;
          margem_minima_pct?: number;
          multa_atraso_pct?: number;
          nf_envio_email?: boolean;
          nf_numeracao_automatica?: boolean;
          nf_proxima_numeracao?: string;
          nf_serie?: string;
          nome_fantasia?: string;
          particionamento_financeiro?: boolean;
          perfil_padrao_novo_usuario?: string;
          politica_senha?: string;
          razao_social?: string;
          reajuste_automatico_precos?: boolean;
          recebimento_padrao?: string;
          regime_tributario?: string;
          registrar_gps?: boolean;
          retencao_logs_dias?: number;
          sede?: string;
          sessao_expira_min?: number;
          sincronizacao_app?: string;
          tanque_capacidade_litros?: number;
          telefone?: string;
          tolerancia_horimetro?: number;
          updated_at?: string;
          vencimento_dias?: number;
          versao?: number;
          webhook_url?: string;
          whatsapp_numero?: string;
        };
        Relationships: [
          {
            foreignKeyName: "parametros_atualizado_por_fkey";
            columns: ["atualizado_por"];
            isOneToOne: false;
            referencedRelation: "usuarios_retaguarda";
            referencedColumns: ["id"];
          },
        ];
      };
      parametros_historico: {
        Row: {
          alterado_em: string;
          alterado_por: string | null;
          campo: string;
          id: string;
          valor_anterior: string | null;
          valor_novo: string | null;
          versao: number;
        };
        Insert: {
          alterado_em?: string;
          alterado_por?: string | null;
          campo: string;
          id?: string;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          versao: number;
        };
        Update: {
          alterado_em?: string;
          alterado_por?: string | null;
          campo?: string;
          id?: string;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          versao?: number;
        };
        Relationships: [
          {
            foreignKeyName: "parametros_historico_alterado_por_fkey";
            columns: ["alterado_por"];
            isOneToOne: false;
            referencedRelation: "usuarios_retaguarda";
            referencedColumns: ["id"];
          },
        ];
      };
      planos_manutencao: {
        Row: {
          ativo: boolean;
          created_at: string;
          descricao: string;
          equipamento_id: string | null;
          id: string;
          intervalo_horas: number;
          tipo_equipamento: string | null;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          descricao: string;
          equipamento_id?: string | null;
          id?: string;
          intervalo_horas: number;
          tipo_equipamento?: string | null;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          descricao?: string;
          equipamento_id?: string | null;
          id?: string;
          intervalo_horas?: number;
          tipo_equipamento?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planos_manutencao_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
        ];
      };
      precos_fundacao: {
        Row: {
          ativo: boolean;
          created_at: string;
          descricao: string | null;
          diametro_broca_mm: number;
          id: string;
          updated_at: string;
          valor_metro: number;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          descricao?: string | null;
          diametro_broca_mm: number;
          id?: string;
          updated_at?: string;
          valor_metro: number;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          descricao?: string | null;
          diametro_broca_mm?: number;
          id?: string;
          updated_at?: string;
          valor_metro?: number;
        };
        Relationships: [];
      };
      precos_historico: {
        Row: {
          alterado_em: string;
          alterado_por: string | null;
          id: string;
          preco_id: string;
          snapshot: Json;
          tipo: string;
        };
        Insert: {
          alterado_em?: string;
          alterado_por?: string | null;
          id?: string;
          preco_id: string;
          snapshot: Json;
          tipo: string;
        };
        Update: {
          alterado_em?: string;
          alterado_por?: string | null;
          id?: string;
          preco_id?: string;
          snapshot?: Json;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "precos_historico_alterado_por_fkey";
            columns: ["alterado_por"];
            isOneToOne: false;
            referencedRelation: "usuarios_retaguarda";
            referencedColumns: ["id"];
          },
        ];
      };
      precos_hora_maquina: {
        Row: {
          ativo: boolean;
          created_at: string;
          equipamento_id: string | null;
          id: string;
          tipo_equipamento: string | null;
          updated_at: string;
          valor_hora_operada: number;
          valor_hora_seca: number;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          equipamento_id?: string | null;
          id?: string;
          tipo_equipamento?: string | null;
          updated_at?: string;
          valor_hora_operada: number;
          valor_hora_seca: number;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          equipamento_id?: string | null;
          id?: string;
          tipo_equipamento?: string | null;
          updated_at?: string;
          valor_hora_operada?: number;
          valor_hora_seca?: number;
        };
        Relationships: [
          {
            foreignKeyName: "precos_hora_maquina_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
        ];
      };
      precos_mobilizacao: {
        Row: {
          ativo: boolean;
          created_at: string;
          descricao: string;
          id: string;
          updated_at: string;
          valor: number;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          descricao: string;
          id?: string;
          updated_at?: string;
          valor: number;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          descricao?: string;
          id?: string;
          updated_at?: string;
          valor?: number;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          auth: string;
          created_at: string;
          endpoint: string;
          id: string;
          operador_id: string;
          p256dh: string;
          updated_at: string;
          user_agent: string | null;
        };
        Insert: {
          auth: string;
          created_at?: string;
          endpoint: string;
          id?: string;
          operador_id: string;
          p256dh: string;
          updated_at?: string;
          user_agent?: string | null;
        };
        Update: {
          auth?: string;
          created_at?: string;
          endpoint?: string;
          id?: string;
          operador_id?: string;
          p256dh?: string;
          updated_at?: string;
          user_agent?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
        ];
      };
      registros_campo: {
        Row: {
          assinatura: string | null;
          created_at: string;
          dados: Json;
          equipamento_id: string | null;
          id: string;
          op_id: string;
          operador_id: string;
          os_id: string | null;
          registrado_em: string;
          tipo: string;
        };
        Insert: {
          assinatura?: string | null;
          created_at?: string;
          dados: Json;
          equipamento_id?: string | null;
          id: string;
          op_id: string;
          operador_id: string;
          os_id?: string | null;
          registrado_em?: string;
          tipo: string;
        };
        Update: {
          assinatura?: string | null;
          created_at?: string;
          dados?: Json;
          equipamento_id?: string | null;
          id?: string;
          op_id?: string;
          operador_id?: string;
          os_id?: string | null;
          registrado_em?: string;
          tipo?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registros_campo_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registros_campo_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registros_campo_os_id_fkey";
            columns: ["os_id"];
            isOneToOne: false;
            referencedRelation: "ordens_servico";
            referencedColumns: ["id"];
          },
        ];
      };
      registros_manutencao: {
        Row: {
          aberta_em: string;
          created_at: string;
          custo: number | null;
          descricao: string | null;
          equipamento_id: string;
          fornecedor: string | null;
          horimetro_abertura: number | null;
          horimetro_previsto: number | null;
          horimetro_realizado: number | null;
          id: string;
          observacao: string | null;
          origem_registro_campo_id: string | null;
          plano_id: string | null;
          prioridade: string;
          realizada_em: string | null;
          status: string;
          tipo: string;
          updated_at: string;
        };
        Insert: {
          aberta_em?: string;
          created_at?: string;
          custo?: number | null;
          descricao?: string | null;
          equipamento_id: string;
          fornecedor?: string | null;
          horimetro_abertura?: number | null;
          horimetro_previsto?: number | null;
          horimetro_realizado?: number | null;
          id?: string;
          observacao?: string | null;
          origem_registro_campo_id?: string | null;
          plano_id?: string | null;
          prioridade?: string;
          realizada_em?: string | null;
          status?: string;
          tipo?: string;
          updated_at?: string;
        };
        Update: {
          aberta_em?: string;
          created_at?: string;
          custo?: number | null;
          descricao?: string | null;
          equipamento_id?: string;
          fornecedor?: string | null;
          horimetro_abertura?: number | null;
          horimetro_previsto?: number | null;
          horimetro_realizado?: number | null;
          id?: string;
          observacao?: string | null;
          origem_registro_campo_id?: string | null;
          plano_id?: string | null;
          prioridade?: string;
          realizada_em?: string | null;
          status?: string;
          tipo?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registros_manutencao_equipamento_id_fkey";
            columns: ["equipamento_id"];
            isOneToOne: false;
            referencedRelation: "equipamentos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registros_manutencao_origem_registro_campo_id_fkey";
            columns: ["origem_registro_campo_id"];
            isOneToOne: false;
            referencedRelation: "registros_campo";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registros_manutencao_plano_id_fkey";
            columns: ["plano_id"];
            isOneToOne: false;
            referencedRelation: "planos_manutencao";
            referencedColumns: ["id"];
          },
        ];
      };
      usuarios_retaguarda: {
        Row: {
          created_at: string;
          id: string;
          nome: string;
          perfil: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          nome: string;
          perfil: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nome?: string;
          perfil?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      criar_notificacao: {
        Args: {
          p_mensagem: string;
          p_operador_id: string;
          p_origem_id?: string;
          p_os_id?: string;
          p_tipo: string;
          p_titulo: string;
        };
        Returns: string;
      };
      criar_notificacao_interna: {
        Args: {
          p_mensagem: string;
          p_operador_id: string;
          p_origem_id?: string;
          p_os_id?: string;
          p_tipo: string;
          p_titulo: string;
        };
        Returns: string;
      };
      criar_notificacao_retaguarda: {
        Args: {
          p_categoria: string;
          p_mensagem: string;
          p_origem_id?: string;
          p_os_id?: string;
          p_prioridade?: string;
          p_tipo: string;
          p_titulo: string;
        };
        Returns: number;
      };
      criar_operador: {
        Args: {
          p_admissao?: string;
          p_ativo?: boolean;
          p_base?: string;
          p_cnh_categoria?: string;
          p_cnh_validade?: string;
          p_cpf: string;
          p_data_nascimento?: string;
          p_equipamentos_ids?: string[];
          p_nome: string;
          p_telefone: string;
          p_vinculo?: string;
        };
        Returns: Json;
      };
      finalizar_apontamento: {
        Args: {
          p_foto_final_url?: string;
          p_horimetro_final: number;
          p_id: string;
          p_metros_executados?: number;
          p_observacao?: string;
          p_token: string;
        };
        Returns: {
          created_at: string;
          equipamento_id: string;
          finalizado_em: string | null;
          foto_final_url: string | null;
          foto_inicial_url: string | null;
          horas_trabalhadas: number | null;
          horimetro_final: number | null;
          horimetro_inicial: number;
          id: string;
          iniciado_em: string;
          metros_executados: number | null;
          modalidade: string | null;
          observacao: string | null;
          operador_id: string;
          os_id: string | null;
          pendente_sync: boolean;
          status: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "apontamentos";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      gerar_lembretes_apontamento: { Args: never; Returns: number };
      gerar_notificacoes_retaguarda: { Args: never; Returns: number };
      iniciar_apontamento: {
        Args: {
          p_equipamento_id: string;
          p_foto_inicial_url?: string;
          p_horimetro_inicial: number;
          p_id: string;
          p_modalidade?: string;
          p_observacao?: string;
          p_os_id?: string;
          p_token: string;
        };
        Returns: {
          created_at: string;
          equipamento_id: string;
          finalizado_em: string | null;
          foto_final_url: string | null;
          foto_inicial_url: string | null;
          horas_trabalhadas: number | null;
          horimetro_final: number | null;
          horimetro_inicial: number;
          id: string;
          iniciado_em: string;
          metros_executados: number | null;
          modalidade: string | null;
          observacao: string | null;
          operador_id: string;
          os_id: string | null;
          pendente_sync: boolean;
          status: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "apontamentos";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      is_retaguarda: { Args: never; Returns: boolean };
      liberar_notificacoes_agendadas: { Args: never; Returns: number };
      limpar_notificacoes_antigas: { Args: never; Returns: number };
      limpar_push_subscriptions_expiradas: { Args: never; Returns: number };
      listar_abastecimentos_operador: {
        Args: { p_token: string };
        Returns: {
          abastecido_em: string;
          created_at: string;
          equipamento_id: string;
          horimetro: number;
          id: string;
          litros: number;
          local: string;
          operador_id: string;
          origem: string;
          updated_at: string;
        }[];
      };
      listar_apontamentos_operador: {
        Args: { p_token: string };
        Returns: {
          created_at: string;
          equipamento_id: string;
          finalizado_em: string | null;
          foto_final_url: string | null;
          foto_inicial_url: string | null;
          horas_trabalhadas: number | null;
          horimetro_final: number | null;
          horimetro_inicial: number;
          id: string;
          iniciado_em: string;
          metros_executados: number | null;
          modalidade: string | null;
          observacao: string | null;
          operador_id: string;
          os_id: string | null;
          pendente_sync: boolean;
          status: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "apontamentos";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      listar_notificacoes: {
        Args: { p_limite?: number; p_token: string };
        Returns: {
          acao: string | null;
          agendada_para: string | null;
          canais: string[] | null;
          categoria: string;
          created_at: string;
          enviada_em: string | null;
          id: string;
          lida_em: string | null;
          mensagem: string;
          operador_id: string | null;
          origem_id: string | null;
          os_id: string | null;
          prioridade: string;
          tipo: string;
          titulo: string;
          updated_at: string;
          usuario_id: string | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "notificacoes";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      listar_ordens_operador: {
        Args: { p_token: string };
        Returns: {
          aberta_em: string;
          cliente_id: string;
          created_at: string;
          diametro_broca_mm: number | null;
          endereco: string | null;
          equipamento_previsto_id: string | null;
          fechada_em: string | null;
          id: string;
          inicio_previsto: string | null;
          modelo_cobranca: string;
          numero: string;
          obra_nome: string;
          observacao: string | null;
          pendente_sync: boolean;
          responsavel_id: string | null;
          status: string;
          tipo_servico: string | null;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "ordens_servico";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      listar_planos_manutencao_operador: {
        Args: { p_token: string };
        Returns: {
          ativo: boolean;
          created_at: string;
          descricao: string;
          equipamento_id: string | null;
          id: string;
          intervalo_horas: number;
          tipo_equipamento: string | null;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "planos_manutencao";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      listar_registros_campo_operador: {
        Args: { p_token: string };
        Returns: {
          created_at: string;
          dados: Json;
          equipamento_id: string;
          id: string;
          op_id: string;
          operador_id: string;
          os_id: string;
          registrado_em: string;
          tipo: string;
        }[];
      };
      listar_registros_manutencao_operador: {
        Args: { p_token: string };
        Returns: {
          aberta_em: string;
          created_at: string;
          descricao: string;
          equipamento_id: string;
          horimetro_abertura: number;
          horimetro_previsto: number;
          horimetro_realizado: number;
          id: string;
          plano_id: string;
          prioridade: string;
          realizada_em: string;
          status: string;
          tipo: string;
          updated_at: string;
        }[];
      };
      login_operador: {
        Args: {
          p_operador_id: string;
          p_pin: string;
          p_dispositivo?: string;
          p_app_versao?: string;
        };
        Returns: Json;
      };
      logout_operador: { Args: { p_token: string }; Returns: undefined };
      tocar_sessao_operador: {
        Args: { p_token: string; p_dispositivo?: string; p_app_versao?: string };
        Returns: undefined;
      };
      acesso_app_operador: {
        Args: { p_operador_id: string };
        Returns: Json;
      };
      acesso_app_operadores: {
        Args: Record<PropertyKey, never>;
        Returns: {
          operador_id: string;
          liberado: boolean;
          ultimo_acesso: string | null;
          dispositivo: string | null;
          app_versao: string | null;
        }[];
      };
      definir_equipamentos_operador: {
        Args: { p_operador_id: string; p_equipamentos_ids: string[] };
        Returns: undefined;
      };
      marcar_notificacoes_lidas: {
        Args: { p_ids?: string[]; p_token: string };
        Returns: number;
      };
      marcar_push_aberto: {
        Args: { p_notificacao_id: string; p_token: string };
        Returns: undefined;
      };
      notificacao_e_critica: {
        Args: { p_prioridade: string; p_tipo: string };
        Returns: boolean;
      };
      notificacoes_acordar_funcao: {
        Args: { p_body: Json; p_secret_auth: string; p_secret_url: string };
        Returns: undefined;
      };
      notificacoes_em_silencio: { Args: never; Returns: boolean };
      notificacoes_push_na_hora: {
        Args: { p_operador_id: string };
        Returns: number;
      };
      operador_do_token: { Args: { p_token: string }; Returns: string };
      ordens_do_operador_ids: {
        Args: { p_operador_id: string };
        Returns: string[];
      };
      parametros_campos_de_negocio: {
        Args: { registro: Database["public"]["Tables"]["parametros"]["Row"] };
        Returns: Json;
      };
      processar_entrega_notificacao: {
        Args: { p_notificacao_id: string };
        Returns: undefined;
      };
      registrar_abastecimento_operador: {
        Args: {
          p_equipamento_id: string;
          p_horimetro: number;
          p_id: string;
          p_litros: number;
          p_local?: string;
          p_token: string;
        };
        Returns: {
          abastecido_em: string;
          created_at: string;
          custo_total: number | null;
          equipamento_id: string;
          horimetro: number;
          id: string;
          litros: number;
          local: string | null;
          operador_id: string | null;
          origem: string;
          preco_litro: number | null;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "abastecimentos";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      registrar_notificacao_propria: {
        Args: {
          p_mensagem: string;
          p_origem_id?: string;
          p_os_id?: string;
          p_tipo: string;
          p_titulo: string;
          p_token: string;
        };
        Returns: string;
      };
      registrar_push_subscription: {
        Args: {
          p_auth: string;
          p_endpoint: string;
          p_p256dh: string;
          p_token: string;
          p_user_agent?: string;
        };
        Returns: undefined;
      };
      registrar_registro_campo: {
        Args: {
          p_assinatura?: string;
          p_dados: Json;
          p_equipamento_id?: string;
          p_id: string;
          p_op_id: string;
          p_os_id?: string;
          p_registrado_em: string;
          p_tipo: string;
          p_token: string;
        };
        Returns: {
          assinatura: string | null;
          created_at: string;
          dados: Json;
          equipamento_id: string | null;
          id: string;
          op_id: string;
          operador_id: string;
          os_id: string | null;
          registrado_em: string;
          tipo: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "registros_campo";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      remover_push_subscription: {
        Args: { p_endpoint: string; p_token: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
