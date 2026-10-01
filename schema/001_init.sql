-- Sistema de RDO Digital — schema inicial
-- Fonte: MODELO_DE_DADOS.md
-- PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE perfil_usuario AS ENUM (
  'ADMINISTRADOR',
  'EMITENTE',
  'RESPONSAVEL',
  'PLANEJAMENTO'
);

CREATE TYPE perfil_destino_convite AS ENUM (
  'EMITENTE',
  'RESPONSAVEL',
  'PLANEJAMENTO'
);

CREATE TYPE nivel_acesso AS ENUM ('N1', 'N2', 'N3');

CREATE TYPE nivel_acesso_equipe AS ENUM ('N1', 'N2');

CREATE TYPE tipo_visto AS ENUM ('ENCARREGADO', 'SUPERVISOR', 'CLIENTE');

CREATE TYPE evento_log_seguranca AS ENUM (
  'LOGIN_OK',
  'LOGIN_FALHA',
  'LOGOUT',
  'CONVITE_ENVIADO',
  'CONVITE_ACEITO',
  'CONVITE_REVOGADO',
  'CONVITE_REENVIADO',
  'SENHA_RESET_SOLICITADO',
  'SENHA_RESET_CONCLUIDO',
  'CONTA_ATIVADA',
  'CONTA_DESATIVADA'
);

CREATE TYPE disciplina_rdo AS ENUM ('ACESSO_POR_CORDAS');

CREATE TYPE tipo_rdo AS ENUM (
  'ISOLAMENTO_TORRES',
  'ISOLAMENTO_TUBULACOES',
  'PINTURA_TORRES',
  'PINTURA_TUBULACOES'
);

CREATE TYPE status_rdo AS ENUM (
  'RASCUNHO',
  'AGUARDANDO_RESPONSAVEL',
  'DEVOLVIDO',
  'LIBERADO',
  'ARQUIVADO'
);

CREATE TYPE turno_rdo AS ENUM ('DIURNO', 'NOTURNO');

CREATE TYPE clima_periodo AS ENUM ('BOM', 'NUBLADO', 'CHUVA');

CREATE TYPE situacao_item AS ENUM ('EM_ANDAMENTO', 'CONCLUIDO');

CREATE TYPE decisao_revisao AS ENUM ('APROVADO', 'DEVOLVIDO');

CREATE TYPE tipo_documento AS ENUM ('PDF_EMITIDO');

CREATE TYPE evento_historico_rdo AS ENUM (
  'CRIADO',
  'ATUALIZADO',
  'EMITIDO',
  'PDF_GERADO',
  'ENCAMINHADO_RESPONSAVEL',
  'RESPONSAVEL_ALTERADO',
  'APROVADO_RESPONSAVEL',
  'DEVOLVIDO_RESPONSAVEL',
  'REEMITIDO',
  'ENCAMINHADO_PLANEJAMENTO',
  'LANCADO_AVANCO',
  'DESMARCADO_AVANCO',
  'LANCADO_DHT',
  'DESMARCADO_DHT',
  'ARQUIVADO',
  'PDF_BAIXADO'
);

CREATE TABLE cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX cargos_nome_ativo_uidx ON cargos (nome) WHERE ativo = TRUE;

CREATE TABLE funcionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula VARCHAR(30) NOT NULL,
  nome VARCHAR(150) NOT NULL,
  cargo_id UUID NOT NULL REFERENCES cargos (id) ON DELETE RESTRICT,
  nivel_acesso nivel_acesso NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT funcionarios_matricula_uk UNIQUE (matricula)
);

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id UUID REFERENCES funcionarios (id) ON DELETE RESTRICT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  senha_hash VARCHAR(255),
  perfil perfil_usuario NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_login_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_email_uk UNIQUE (email),
  CONSTRAINT usuarios_funcionario_id_uk UNIQUE (funcionario_id),
  CONSTRAINT usuarios_email_minusculas_chk CHECK (email = lower(email)),
  CONSTRAINT usuarios_perfil_funcionario_chk CHECK (
    (perfil = 'ADMINISTRADOR' AND funcionario_id IS NULL)
    OR (perfil = 'PLANEJAMENTO')
    OR (perfil IN ('EMITENTE', 'RESPONSAVEL') AND funcionario_id IS NOT NULL)
  )
);

CREATE TABLE convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enviado_por_usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  email VARCHAR(254) NOT NULL,
  perfil_destino perfil_destino_convite NOT NULL,
  funcionario_id UUID REFERENCES funcionarios (id) ON DELETE RESTRICT,
  token_hash VARCHAR(255) NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  aceito_em TIMESTAMPTZ,
  revogado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT convites_token_hash_uk UNIQUE (token_hash),
  CONSTRAINT convites_email_minusculas_chk CHECK (email = lower(email)),
  CONSTRAINT convites_funcionario_perfil_chk CHECK (
    (perfil_destino = 'PLANEJAMENTO' AND funcionario_id IS NULL)
    OR (perfil_destino IN ('EMITENTE', 'RESPONSAVEL') AND funcionario_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX convites_email_nao_aceito_uidx
  ON convites (email)
  WHERE aceito_em IS NULL;

CREATE TABLE sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  ultimo_uso_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  revogada_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sessoes_token_hash_uk UNIQUE (token_hash)
);

CREATE INDEX sessoes_usuario_id_idx ON sessoes (usuario_id);
CREATE INDEX sessoes_expira_em_idx ON sessoes (expira_em);

CREATE TABLE recuperacoes_senha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  usado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT recuperacoes_senha_token_hash_uk UNIQUE (token_hash)
);

CREATE TABLE logs_seguranca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  email_tentativa VARCHAR(254),
  evento evento_log_seguranca NOT NULL,
  ip VARCHAR(45),
  user_agent VARCHAR(255),
  detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
  ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX logs_seguranca_usuario_id_idx ON logs_seguranca (usuario_id);
CREATE INDEX logs_seguranca_ocorrido_em_idx ON logs_seguranca (ocorrido_em DESC);
CREATE INDEX logs_seguranca_evento_idx ON logs_seguranca (evento);

CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX areas_nome_ativo_uidx ON areas (nome) WHERE ativo = TRUE;

CREATE TABLE fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX fiscais_nome_ativo_uidx ON fiscais (nome) WHERE ativo = TRUE;

CREATE TABLE pacotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX pacotes_nome_ativo_uidx ON pacotes (nome) WHERE ativo = TRUE;

CREATE TABLE vistos_cadastrados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_responsavel VARCHAR(150) NOT NULL,
  tipo_visto tipo_visto NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rdo_numeracoes (
  ano SMALLINT PRIMARY KEY,
  ultimo_numero INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT rdo_numeracoes_ano_chk CHECK (ano >= 2000 AND ano <= 2100),
  CONSTRAINT rdo_numeracoes_ultimo_numero_chk CHECK (ultimo_numero >= 0)
);

CREATE TABLE rdos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20),
  disciplina disciplina_rdo NOT NULL DEFAULT 'ACESSO_POR_CORDAS',
  tipo tipo_rdo NOT NULL,
  status status_rdo NOT NULL DEFAULT 'RASCUNHO',
  data_servico DATE,
  turno turno_rdo,
  inicio_servico_em TIMESTAMPTZ,
  fim_servico_em TIMESTAMPTZ,
  clima_manha clima_periodo,
  clima_tarde clima_periodo,
  clima_noite clima_periodo,
  area_id UUID REFERENCES areas (id) ON DELETE RESTRICT,
  fiscal_id UUID REFERENCES fiscais (id) ON DELETE RESTRICT,
  pacote_id UUID REFERENCES pacotes (id) ON DELETE RESTRICT,
  responsavel_lider_id UUID REFERENCES funcionarios (id) ON DELETE RESTRICT,
  emitido_por_usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  observacao_priner TEXT,
  observacao_fiscalizacao TEXT,
  area_nome_snapshot VARCHAR(150),
  fiscal_nome_snapshot VARCHAR(150),
  pacote_nome_snapshot VARCHAR(150),
  responsavel_lider_nome_snapshot VARCHAR(150),
  emitido_em TIMESTAMPTZ,
  liberado_em TIMESTAMPTZ,
  liberado_por_usuario_id UUID REFERENCES usuarios (id) ON DELETE RESTRICT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdos_numero_uk UNIQUE (numero),
  CONSTRAINT rdos_numero_formato_chk CHECK (
    numero IS NULL OR numero ~ '^RDO-[0-9]{4}-[0-9]{6}$'
  ),
  CONSTRAINT rdos_rascunho_sem_numero_chk CHECK (
    (status = 'RASCUNHO' AND numero IS NULL AND emitido_em IS NULL)
    OR (status <> 'RASCUNHO' AND numero IS NOT NULL AND emitido_em IS NOT NULL)
  ),
  CONSTRAINT rdos_liberado_chk CHECK (
    (status NOT IN ('LIBERADO', 'ARQUIVADO') AND liberado_em IS NULL AND liberado_por_usuario_id IS NULL)
    OR (status IN ('LIBERADO', 'ARQUIVADO') AND liberado_em IS NOT NULL AND liberado_por_usuario_id IS NOT NULL)
  )
);

CREATE INDEX rdos_status_data_idx ON rdos (status, data_servico DESC NULLS LAST);
CREATE INDEX rdos_responsavel_lider_id_idx ON rdos (responsavel_lider_id);
CREATE INDEX rdos_emitido_por_usuario_id_idx ON rdos (emitido_por_usuario_id);
CREATE INDEX rdos_area_id_idx ON rdos (area_id);
CREATE INDEX rdos_pacote_id_idx ON rdos (pacote_id);

CREATE TABLE rdo_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  numero_item SMALLINT NOT NULL,
  rec VARCHAR(60),
  tag VARCHAR(100),
  numero_pt VARCHAR(60),
  pt_solicitada_em TIMESTAMPTZ,
  pt_liberada_em TIMESTAMPTZ,
  pt_encerrada_em TIMESTAMPTZ,
  observacao TEXT,
  incluido_em_versao SMALLINT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdo_servicos_item_uk UNIQUE (rdo_id, numero_item),
  CONSTRAINT rdo_servicos_numero_item_chk CHECK (numero_item > 0),
  CONSTRAINT rdo_servicos_incluido_em_versao_chk CHECK (
    incluido_em_versao IS NULL OR incluido_em_versao > 0
  )
);

CREATE INDEX rdo_servicos_tag_idx ON rdo_servicos (tag);
CREATE INDEX rdo_servicos_rec_idx ON rdo_servicos (rec);
CREATE INDEX rdo_servicos_numero_pt_idx ON rdo_servicos (numero_pt);

CREATE TABLE rdo_equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  funcionario_id UUID NOT NULL REFERENCES funcionarios (id) ON DELETE RESTRICT,
  matricula_snapshot VARCHAR(30),
  nome_snapshot VARCHAR(150),
  cargo_nome_snapshot VARCHAR(100),
  nivel_acesso_snapshot nivel_acesso_equipe,
  entrada_em TIMESTAMPTZ,
  saida_em TIMESTAMPTZ,
  obrigatorio BOOLEAN NOT NULL DEFAULT FALSE,
  incluido_em_versao SMALLINT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdo_equipes_funcionario_uk UNIQUE (rdo_id, funcionario_id),
  CONSTRAINT rdo_equipes_incluido_em_versao_chk CHECK (
    incluido_em_versao IS NULL OR incluido_em_versao > 0
  )
);

CREATE INDEX rdo_equipes_funcionario_id_idx ON rdo_equipes (funcionario_id);

CREATE TABLE rdo_equipe_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_equipe_id UUID NOT NULL REFERENCES rdo_equipes (id) ON DELETE CASCADE,
  rdo_servico_id UUID NOT NULL REFERENCES rdo_servicos (id) ON DELETE CASCADE,
  emitente_pt BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdo_equipe_servicos_uk UNIQUE (rdo_equipe_id, rdo_servico_id)
);

CREATE INDEX rdo_equipe_servicos_servico_idx ON rdo_equipe_servicos (rdo_servico_id);

CREATE TABLE rdo_itens_executados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  rdo_servico_id UUID NOT NULL REFERENCES rdo_servicos (id) ON DELETE RESTRICT,
  numero_item SMALLINT NOT NULL,
  identificacao_equipamento VARCHAR(100) NOT NULL,
  cml VARCHAR(80),
  remocao BOOLEAN NOT NULL DEFAULT FALSE,
  recomposicao_isolamento BOOLEAN NOT NULL DEFAULT FALSE,
  recomposicao_funilaria BOOLEAN NOT NULL DEFAULT FALSE,
  tratamento BOOLEAN NOT NULL DEFAULT FALSE,
  fundo_intermediaria BOOLEAN NOT NULL DEFAULT FALSE,
  acabamento BOOLEAN NOT NULL DEFAULT FALSE,
  largura_mm NUMERIC(12, 2),
  altura_mm NUMERIC(12, 2),
  situacao situacao_item,
  escopo_inicial VARCHAR(150),
  abrangencia VARCHAR(150),
  observacao TEXT,
  incluido_em_versao SMALLINT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdo_itens_executados_item_uk UNIQUE (rdo_id, numero_item),
  CONSTRAINT rdo_itens_executados_numero_item_chk CHECK (numero_item > 0),
  CONSTRAINT rdo_itens_executados_largura_chk CHECK (largura_mm IS NULL OR largura_mm > 0),
  CONSTRAINT rdo_itens_executados_altura_chk CHECK (altura_mm IS NULL OR altura_mm > 0),
  CONSTRAINT rdo_itens_executados_incluido_em_versao_chk CHECK (
    incluido_em_versao IS NULL OR incluido_em_versao > 0
  )
);

CREATE INDEX rdo_itens_executados_cml_idx ON rdo_itens_executados (cml);
CREATE INDEX rdo_itens_executados_servico_idx ON rdo_itens_executados (rdo_servico_id);

CREATE TABLE rdo_vistos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  visto_cadastrado_id UUID NOT NULL REFERENCES vistos_cadastrados (id) ON DELETE RESTRICT,
  tipo_visto tipo_visto NOT NULL,
  nome_responsavel_snapshot VARCHAR(150) NOT NULL,
  registrado_por_usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  registrado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdo_vistos_tipo_uk UNIQUE (rdo_id, tipo_visto)
);

CREATE TABLE rdo_revisoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  revisor_usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  decisao decisao_revisao NOT NULL,
  observacao TEXT,
  ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdo_revisoes_observacao_devolucao_chk CHECK (
    decisao <> 'DEVOLVIDO'
    OR (observacao IS NOT NULL AND length(trim(observacao)) > 0)
  )
);

CREATE INDEX rdo_revisoes_rdo_ocorrido_idx ON rdo_revisoes (rdo_id, ocorrido_em DESC);

CREATE TABLE rdo_planejamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  lancado_avanco_em TIMESTAMPTZ,
  lancado_avanco_por_usuario_id UUID REFERENCES usuarios (id) ON DELETE RESTRICT,
  lancado_dht_em TIMESTAMPTZ,
  lancado_dht_por_usuario_id UUID REFERENCES usuarios (id) ON DELETE RESTRICT,
  arquivado_em TIMESTAMPTZ,
  arquivado_por_usuario_id UUID REFERENCES usuarios (id) ON DELETE RESTRICT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rdo_planejamentos_rdo_uk UNIQUE (rdo_id),
  CONSTRAINT rdo_planejamentos_avanco_chk CHECK (
    (lancado_avanco_em IS NULL) = (lancado_avanco_por_usuario_id IS NULL)
  ),
  CONSTRAINT rdo_planejamentos_dht_chk CHECK (
    (lancado_dht_em IS NULL) = (lancado_dht_por_usuario_id IS NULL)
  ),
  CONSTRAINT rdo_planejamentos_arquivado_chk CHECK (
    (arquivado_em IS NULL) = (arquivado_por_usuario_id IS NULL)
  )
);

CREATE INDEX rdo_planejamentos_arquivado_em_idx ON rdo_planejamentos (arquivado_em);
CREATE INDEX rdo_planejamentos_lancado_avanco_em_idx ON rdo_planejamentos (lancado_avanco_em);
CREATE INDEX rdo_planejamentos_lancado_dht_em_idx ON rdo_planejamentos (lancado_dht_em);

CREATE TABLE rdo_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  tipo tipo_documento NOT NULL DEFAULT 'PDF_EMITIDO',
  versao SMALLINT NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  chave_armazenamento VARCHAR(500) NOT NULL,
  checksum_sha256 CHAR(64) NOT NULL,
  gerado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  gerado_por_usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  CONSTRAINT rdo_documentos_versao_uk UNIQUE (rdo_id, versao),
  CONSTRAINT rdo_documentos_versao_chk CHECK (versao > 0),
  CONSTRAINT rdo_documentos_checksum_chk CHECK (checksum_sha256 ~ '^[0-9a-f]{64}$')
);

CREATE TABLE rdo_historicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rdo_id UUID NOT NULL REFERENCES rdos (id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios (id) ON DELETE SET NULL,
  evento evento_historico_rdo NOT NULL,
  detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
  ocorrido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX rdo_historicos_rdo_ocorrido_idx ON rdo_historicos (rdo_id, ocorrido_em DESC);
CREATE INDEX rdo_historicos_evento_idx ON rdo_historicos (evento);

CREATE OR REPLACE FUNCTION fn_mesmo_rdo_equipe_servico()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  equipe_rdo UUID;
  servico_rdo UUID;
BEGIN
  SELECT rdo_id INTO equipe_rdo FROM rdo_equipes WHERE id = NEW.rdo_equipe_id;
  SELECT rdo_id INTO servico_rdo FROM rdo_servicos WHERE id = NEW.rdo_servico_id;
  IF equipe_rdo IS DISTINCT FROM servico_rdo THEN
    RAISE EXCEPTION 'rdo_equipe_servicos exige equipe e servico do mesmo RDO';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_mesmo_rdo_equipe_servico
BEFORE INSERT OR UPDATE OF rdo_equipe_id, rdo_servico_id
ON rdo_equipe_servicos
FOR EACH ROW
EXECUTE PROCEDURE fn_mesmo_rdo_equipe_servico();

CREATE OR REPLACE FUNCTION fn_item_mesmo_rdo_servico()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  servico_rdo UUID;
BEGIN
  SELECT rdo_id INTO servico_rdo FROM rdo_servicos WHERE id = NEW.rdo_servico_id;
  IF servico_rdo IS DISTINCT FROM NEW.rdo_id THEN
    RAISE EXCEPTION 'rdo_itens_executados.rdo_servico_id deve pertencer ao mesmo RDO';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_item_mesmo_rdo_servico
BEFORE INSERT OR UPDATE OF rdo_id, rdo_servico_id
ON rdo_itens_executados
FOR EACH ROW
EXECUTE PROCEDURE fn_item_mesmo_rdo_servico();

CREATE OR REPLACE FUNCTION fn_item_etapas_por_tipo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  tipo_atual tipo_rdo;
  eh_isolamento BOOLEAN;
BEGIN
  SELECT tipo INTO tipo_atual FROM rdos WHERE id = NEW.rdo_id;
  eh_isolamento := tipo_atual IN ('ISOLAMENTO_TORRES', 'ISOLAMENTO_TUBULACOES');

  IF eh_isolamento THEN
    IF NEW.tratamento OR NEW.fundo_intermediaria OR NEW.acabamento THEN
      RAISE EXCEPTION 'item de isolamento nao pode ter etapas de pintura';
    END IF;
  ELSE
    IF NEW.remocao OR NEW.recomposicao_isolamento OR NEW.recomposicao_funilaria THEN
      RAISE EXCEPTION 'item de pintura nao pode ter etapas de isolamento';
    END IF;
    IF NEW.largura_mm IS NOT NULL OR NEW.altura_mm IS NOT NULL THEN
      RAISE EXCEPTION 'item de pintura nao pode ter largura ou altura';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_item_etapas_por_tipo
BEFORE INSERT OR UPDATE
ON rdo_itens_executados
FOR EACH ROW
EXECUTE PROCEDURE fn_item_etapas_por_tipo();

CREATE OR REPLACE FUNCTION fn_bloquear_exclusao_linha_emitida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.incluido_em_versao IS NOT NULL THEN
    RAISE EXCEPTION 'linha ja emitida nao pode ser excluida';
  END IF;
  IF TG_TABLE_NAME = 'rdo_equipes' AND OLD.obrigatorio = TRUE THEN
    RAISE EXCEPTION 'integrante obrigatorio do emitente nao pode ser removido';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_bloquear_exclusao_servico_emitido
BEFORE DELETE ON rdo_servicos
FOR EACH ROW
EXECUTE PROCEDURE fn_bloquear_exclusao_linha_emitida();

CREATE TRIGGER trg_bloquear_exclusao_equipe_emitida
BEFORE DELETE ON rdo_equipes
FOR EACH ROW
EXECUTE PROCEDURE fn_bloquear_exclusao_linha_emitida();

CREATE TRIGGER trg_bloquear_exclusao_item_emitido
BEFORE DELETE ON rdo_itens_executados
FOR EACH ROW
EXECUTE PROCEDURE fn_bloquear_exclusao_linha_emitida();

CREATE OR REPLACE FUNCTION fn_rdos_tipo_imutavel()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (OLD.numero IS NOT NULL OR OLD.status <> 'RASCUNHO')
     AND NEW.tipo IS DISTINCT FROM OLD.tipo THEN
    RAISE EXCEPTION 'Tipo do RDO nao pode ser alterado apos a primeira emissao.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rdos_tipo_imutavel
BEFORE UPDATE OF tipo ON rdos
FOR EACH ROW
EXECUTE PROCEDURE fn_rdos_tipo_imutavel();

CREATE OR REPLACE FUNCTION fn_rdos_arquivado_definitivo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'ARQUIVADO' THEN
    RAISE EXCEPTION 'RDO arquivado nao pode ser alterado.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rdos_arquivado_definitivo
BEFORE UPDATE ON rdos
FOR EACH ROW
EXECUTE PROCEDURE fn_rdos_arquivado_definitivo();
