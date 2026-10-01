# Modelo de Dados Congelado — Sistema de RDO Digital

**Status:** congelado. Schema SQL em `schema/001_init.sql`.  
**Base:** `ANALISE_DE_REQUISITOS.md` + decisões das 14 lacunas (26/09/2026).  
**Ponto 14 (sessão):** cookie opaco (token aleatório em `token_hash`, não JWT); 8h de inatividade, renovável a cada requisição.

Este arquivo é a fonte da verdade do banco. Em conflito com a análise de requisitos, vale o que está aqui.

---

## Convenções

- PK: `id` UUID em todas as tabelas, salvo `RdoNumeracao` (`ano`).
- Datas: `TIMESTAMPTZ`, fuso `America/Sao_Paulo`.
- Cadastros: exclusão lógica (`ativo = false`). Nunca apagar fisicamente se já referenciados.
- Segredos: somente hash. Senha, token de convite, sessão e reset nunca em texto.
- Snapshots: nomes de cadastro copiados na emissão/reemissão. Alterar cadastro depois não muda RDO emitido.
- JSON de auditoria: sem senha, token ou segredo.

Avanço e DHT **não** são status do RDO. São marcadores em `RdoPlanejamento`.

---

## 1. Entidades e campos

### 1.1 Acesso e segurança

#### Usuario

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| funcionario_id | UUID? | Único se informado. Obrigatório para `EMITENTE` e `RESPONSAVEL`. Sempre nulo para `ADMINISTRADOR`. Nulo para `PLANEJAMENTO` no MVP |
| nome | VARCHAR(120) | Obrigatório |
| email | VARCHAR(254) | Único, armazenado em minúsculas |
| senha_hash | VARCHAR(255)? | Nulo até aceitar convite. Admin seed já nasce com hash |
| perfil | ENUM | `ADMINISTRADOR`, `EMITENTE`, `RESPONSAVEL`, `PLANEJAMENTO` |
| ativo | BOOLEAN | Default true |
| ultimo_login_em | TIMESTAMPTZ? | |
| criado_em / atualizado_em | TIMESTAMPTZ | |

Primeiro Administrador: seed interno (script/migration), sem convite. `funcionario_id` nulo.

#### Convite

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| enviado_por_usuario_id | UUID | FK Usuario administrador |
| email | VARCHAR(254) | Minúsculas |
| perfil_destino | ENUM | `EMITENTE`, `RESPONSAVEL`, `PLANEJAMENTO` |
| funcionario_id | UUID? | Obrigatório se Emitente (N2) ou Responsável (N3). Nulo se Planejamento |
| token_hash | VARCHAR(255) | Único |
| expira_em | TIMESTAMPTZ | Criação ou último reenvio + 48h |
| aceito_em | TIMESTAMPTZ? | |
| revogado_em | TIMESTAMPTZ? | |
| criado_em | TIMESTAMPTZ | |
| atualizado_em | TIMESTAMPTZ | |

Regras:

- Status derivado: pendente / aceito / expirado / revogado. Sem coluna extra.
- No máximo **1 convite não aceito por e-mail** (pendente, expirado ou revogado). Reenvio **atualiza o mesmo registro**: novo `token_hash`, `expira_em = agora + 48h`, `revogado_em = null`. Token anterior fica inválido.
- Convite de Emitente só com funcionário N2 ativo. Convite de Responsável só com funcionário N3 ativo.
- Funcionário já vinculado a um Usuario ativo não pode receber novo convite.
- Eventos de convite vão **somente** para `LogSeguranca`.

#### Sessao

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID | FK Usuario |
| token_hash | VARCHAR(255) | Único. Cookie opaco: token aleatório (não JWT), armazenado só como hash. Cookie HttpOnly, Secure, SameSite=Lax |
| expira_em | TIMESTAMPTZ | Sliding: a cada requisição autenticada, `expira_em = agora + 8 horas`. Inatividade de 8h invalida a sessão |
| ultimo_uso_em | TIMESTAMPTZ | Atualizado a cada requisição autenticada |
| ip | VARCHAR(45)? | |
| user_agent | VARCHAR(255)? | |
| revogada_em | TIMESTAMPTZ? | Logout, reset de senha ou desativação da conta |
| criado_em | TIMESTAMPTZ | |

#### RecuperacaoSenha

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID | FK Usuario |
| token_hash | VARCHAR(255) | Único, uso único |
| expira_em | TIMESTAMPTZ | |
| usado_em | TIMESTAMPTZ? | |
| criado_em | TIMESTAMPTZ | |

Ao concluir o reset: marca `usado_em` e revoga sessões ativas do usuário.

#### LogSeguranca

Auditoria de conta/acesso. **Não** registra ciclo de vida do RDO.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID? | Nulo em login falho |
| email_tentativa | VARCHAR(254)? | |
| evento | ENUM | `LOGIN_OK`, `LOGIN_FALHA`, `LOGOUT`, `CONVITE_ENVIADO`, `CONVITE_ACEITO`, `CONVITE_REVOGADO`, `CONVITE_REENVIADO`, `SENHA_RESET_SOLICITADO`, `SENHA_RESET_CONCLUIDO`, `CONTA_ATIVADA`, `CONTA_DESATIVADA` |
| ip / user_agent | VARCHAR? | |
| detalhes | JSON | Sem senha/token |
| ocorrido_em | TIMESTAMPTZ | |

### 1.2 Cadastros operacionais

#### Cargo

id UUID, nome VARCHAR(100) único entre ativos, ativo BOOLEAN, timestamps.

#### Funcionario

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| matricula | VARCHAR(30) | Única |
| nome | VARCHAR(150) | |
| cargo_id | UUID | FK Cargo |
| nivel_acesso | ENUM | `N1`, `N2`, `N3` |
| ativo | BOOLEAN | |

#### Area / Fiscal / Pacote

id UUID, nome VARCHAR(150) único entre ativos, ativo BOOLEAN, timestamps.

#### VistoCadastrado

id UUID, nome_responsavel VARCHAR(150), tipo_visto ENUM `ENCARREGADO|SUPERVISOR|CLIENTE`, ativo BOOLEAN, timestamps.

### 1.3 RDO e filhos

#### RdoNumeracao

| Campo | Tipo | Regra |
|---|---|---|
| ano | SMALLINT | PK |
| ultimo_numero | INTEGER | Incremento atômico na **primeira** emissão |

O `AAAA` de `RDO-AAAA-NNNNNN` vem de `emitido_em` (data da emissão), **não** de `data_servico`. Reemissão não gera número novo.

#### Rdo

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| numero | VARCHAR(20)? | Único; nulo em rascunho; imutável depois da 1ª emissão |
| disciplina | ENUM | MVP: `ACESSO_POR_CORDAS` |
| tipo | ENUM | `ISOLAMENTO_TORRES`, `ISOLAMENTO_TUBULACOES`, `PINTURA_TORRES`, `PINTURA_TUBULACOES`. **Imutável após a 1ª emissão** |
| status | ENUM | `RASCUNHO`, `AGUARDANDO_RESPONSAVEL`, `DEVOLVIDO`, `LIBERADO`, `ARQUIVADO` |
| data_servico | DATE | Obrigatória na emissão |
| turno | ENUM | `DIURNO`, `NOTURNO` |
| inicio_servico_em / fim_servico_em | TIMESTAMPTZ | Término após início; pode virar o dia |
| clima_manha / tarde / noite | ENUM? | `BOM`, `NUBLADO`, `CHUVA` |
| area_id, fiscal_id, pacote_id | UUID | FK cadastros; obrigatórias na emissão |
| responsavel_lider_id | UUID | FK Funcionario N3 com Usuario `RESPONSAVEL` ativo. Trocável em `RASCUNHO` e `DEVOLVIDO`. Troca em `DEVOLVIDO` gera `RESPONSAVEL_ALTERADO` no histórico |
| emitido_por_usuario_id | UUID | FK Usuario Emitente. **Um único dono.** Sem co-emitente. Imutável |
| observacao_priner / observacao_fiscalizacao | TEXT? | |
| area_nome_snapshot, fiscal_nome_snapshot, pacote_nome_snapshot, responsavel_lider_nome_snapshot | VARCHAR(150)? | Gravados na emissão/reemissão |
| emitido_em | TIMESTAMPTZ? | Só a 1ª emissão |
| liberado_em | TIMESTAMPTZ? | Última aprovação N3 |
| liberado_por_usuario_id | UUID? | FK Usuario N3 que aprovou |
| criado_em / atualizado_em | TIMESTAMPTZ | |

#### RdoServico

UNIQUE `(rdo_id, numero_item)`.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo |
| numero_item | SMALLINT | Único no RDO |
| rec | VARCHAR(60) | Obrigatório na emissão |
| tag | VARCHAR(100) | Torre ou tubulação |
| numero_pt | VARCHAR(60) | |
| pt_solicitada_em / pt_liberada_em / pt_encerrada_em | TIMESTAMPTZ | Ordem cronológica |
| observacao | TEXT? | |
| incluido_em_versao | SMALLINT? | Nulo até a linha entrar numa emissão. Depois disso **não pode ser excluída** |
| criado_em / atualizado_em | TIMESTAMPTZ | |

Efetivo do serviço = contagem de `RdoEquipeServico`. Não é digitado.

Exclusão: permitida só se `incluido_em_versao IS NULL` (ainda não saiu em PDF). Em `DEVOLVIDO` pode editar campos e **incluir** linhas novas. Linhas já emitidas permanecem.

#### RdoEquipe

UNIQUE `(rdo_id, funcionario_id)`. Somente N1/N2. N3 não entra.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo |
| funcionario_id | UUID | FK Funcionario N1 ou N2 |
| matricula_snapshot, nome_snapshot, cargo_nome_snapshot | VARCHAR | Obrigatórios na emissão |
| nivel_acesso_snapshot | ENUM | `N1` ou `N2` |
| entrada_em / saida_em | TIMESTAMPTZ | Saída após entrada |
| obrigatorio | BOOLEAN | `true` para o funcionário N2 do emitente dono. **Nunca removível**, nem em rascunho |
| incluido_em_versao | SMALLINT? | Mesma regra de exclusão do serviço |
| criado_em / atualizado_em | TIMESTAMPTZ | |

Na criação do RDO, o sistema insere automaticamente o funcionário do emitente com `obrigatorio = true`.

Mínimo na emissão: 1 pessoa (no mínimo o próprio emitente).

#### RdoEquipeServico

N:N equipe × serviço. UNIQUE `(rdo_equipe_id, rdo_servico_id)`. Serviço e equipe devem ser do mesmo RDO.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_equipe_id | UUID | FK RdoEquipe |
| rdo_servico_id | UUID | FK RdoServico |
| emitente_pt | BOOLEAN | Default false |
| criado_em | TIMESTAMPTZ | |

Vínculos podem ser alterados em `RASCUNHO` e `DEVOLVIDO`. Não versionados.

#### RdoItemExecutado

verso (CML). UNIQUE `(rdo_id, numero_item)`. **Opcional na emissão** (mínimo zero).

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo |
| rdo_servico_id | UUID | FK RdoServico do mesmo RDO |
| numero_item | SMALLINT | Único no RDO |
| identificacao_equipamento | VARCHAR(100) | **Pré-preenchido com `RdoServico.tag`**. Snapshot para o PDF; usuário não redigita. Se o tag do serviço mudar em `DEVOLVIDO`, atualiza aqui |
| cml | VARCHAR(80) | |
| remocao, recomposicao_isolamento, recomposicao_funilaria | BOOLEAN | Só isolamento. Pintura = false |
| tratamento, fundo_intermediaria, acabamento | BOOLEAN | Só pintura. Isolamento = false |
| largura_mm / altura_mm | NUMERIC(12,2)? | Só isolamento; > 0 se informado |
| situacao | ENUM | `EM_ANDAMENTO` ou `CONCLUIDO` |
| escopo_inicial / abrangencia | VARCHAR(150)? | |
| observacao | TEXT? | |
| incluido_em_versao | SMALLINT? | Mesma regra de exclusão |
| criado_em / atualizado_em | TIMESTAMPTZ | |

#### RdoVisto

UNIQUE `(rdo_id, tipo_visto)`. No máximo um de cada tipo.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo |
| visto_cadastrado_id | UUID | FK VistoCadastrado |
| tipo_visto | ENUM | Snapshot |
| nome_responsavel_snapshot | VARCHAR(150) | |
| registrado_por_usuario_id | UUID | FK Usuario |
| registrado_em | TIMESTAMPTZ | |

Na emissão/reemissão: **pelo menos 1 visto** (qualquer tipo). Não exige os três.

#### RdoRevisao

Cada ciclo N3. Vigente = registro mais recente.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo |
| revisor_usuario_id | UUID | FK Usuario `RESPONSAVEL`. **Deve ser o Usuario vinculado ao `responsavel_lider_id` vigente no momento da decisão** |
| decisao | ENUM | `APROVADO`, `DEVOLVIDO` |
| observacao | TEXT? | Obrigatória se `DEVOLVIDO` |
| ocorrido_em | TIMESTAMPTZ | |

Nenhum outro N3 pode aprovar ou devolver aquele RDO.

#### RdoPlanejamento

1:1 com Rdo. Criada **quando o N3 libera**. Equivale a `Avanco_DHT` + arquivo.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo, único |
| lancado_avanco_em | TIMESTAMPTZ? | |
| lancado_avanco_por_usuario_id | UUID? | |
| lancado_dht_em | TIMESTAMPTZ? | |
| lancado_dht_por_usuario_id | UUID? | |
| arquivado_em | TIMESTAMPTZ? | |
| arquivado_por_usuario_id | UUID? | |
| atualizado_em | TIMESTAMPTZ | |

- Avanço e DHT podem ser **desmarcados** (correção): zera data/usuário e grava `DESMARCADO_AVANCO` / `DESMARCADO_DHT` no histórico.
- Arquivar **não** exige lançamentos.
- Arquivamento é **definitivo**. Não existe desarquivar no MVP.
- Desmarcar Avanço/DHT ainda é permitido em `ARQUIVADO` (correção pontual, sem voltar status).

#### RdoDocumento

Não versiona serviços/equipe/itens. Versiona só o PDF.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo |
| tipo | ENUM | `PDF_EMITIDO` |
| versao | SMALLINT | 1 na 1ª emissão; +1 a cada reemissão |
| nome_arquivo | VARCHAR(255) | |
| chave_armazenamento | VARCHAR(500) | Caminho interno, não URL pública |
| checksum_sha256 | CHAR(64) | |
| gerado_em | TIMESTAMPTZ | |
| gerado_por_usuario_id | UUID | FK Usuario |

Vigente = maior `versao`. Na emissão/reemissão, linhas com `incluido_em_versao` nulo recebem essa `versao`.

#### RdoHistorico

Ciclo de vida do documento. Convites **não** entram aqui.

| Campo | Tipo | Regra |
|---|---|---|
| id | UUID | PK |
| rdo_id | UUID | FK Rdo |
| usuario_id | UUID? | |
| evento | ENUM | ver lista abaixo |
| detalhes | JSON | Sem segredos. Devolução inclui o texto. Troca de N3 inclui id/nome anterior e novo. Inclusão/alteração de linha identifica tabela, id e campos |
| ocorrido_em | TIMESTAMPTZ | |

Eventos:

`CRIADO`, `ATUALIZADO`, `EMITIDO`, `PDF_GERADO`, `ENCAMINHADO_RESPONSAVEL`, `RESPONSAVEL_ALTERADO`, `APROVADO_RESPONSAVEL`, `DEVOLVIDO_RESPONSAVEL`, `REEMITIDO`, `ENCAMINHADO_PLANEJAMENTO`, `LANCADO_AVANCO`, `DESMARCADO_AVANCO`, `LANCADO_DHT`, `DESMARCADO_DHT`, `ARQUIVADO`, `PDF_BAIXADO`.

Reemissão: atualiza `RdoServico` / `RdoEquipe` / `RdoItemExecutado` **no lugar**. O histórico registra o que mudou. Novo `RdoDocumento` com `versao+1`.

---

## 2. Relacionamentos

```
Cargo 1 ──< N Funcionario
Funcionario 1 ── 0..1 Usuario          Emitente N2 / Responsável N3
Usuario 1 ──< N Convite                admin envia; 1 não-aceito por e-mail
Usuario 1 ──< N Sessao
Usuario 1 ──< N RecuperacaoSenha
Usuario 1 ──< N LogSeguranca

Area | Fiscal | Pacote 1 ──< N Rdo
Funcionario(N3) 1 ──< N Rdo            responsavel_lider_id
Usuario(Emitente) 1 ──< N Rdo          emitido_por_usuario_id; um dono

Rdo 1 ──< N RdoServico
Rdo 1 ──< N RdoEquipe
Funcionario(N1/N2) 1 ──< N RdoEquipe
RdoEquipe N ──< RdoEquipeServico >── N RdoServico
RdoServico 1 ──< N RdoItemExecutado    CML opcional
Rdo 1 ──< N RdoItemExecutado

VistoCadastrado 1 ──< N RdoVisto
Rdo 1 ──< N RdoVisto                   no máx. 1 por tipo; mín. 1 na emissão

Rdo 1 ──< N RdoRevisao
Usuario(N3 do cabeçalho) 1 ──< N RdoRevisao

Rdo 1 ── 0..1 RdoPlanejamento          criada na liberação
Rdo 1 ──< N RdoDocumento
Rdo 1 ──< N RdoHistorico
Usuario 1 ──< N RdoHistorico
RdoNumeracao (ano) ── gera numero do Rdo na 1ª emissão
```

Cardinalidades fechadas:

- 1 RDO, 1 tipo, 1 emitente dono, 1 N3 de cabeçalho.
- Equipe × serviços = N:N.
- 1 serviço, N CMLs (inclusive zero).
- N ciclos de revisão.
- 0..1 ficha de planejamento (0 até liberar).

---

## 3. Máquina de estados

Status reais (não usar emitido / aprovado / lançado como coluna):

| Apelido | Status | Significado |
|---|---|---|
| rascunho | `RASCUNHO` | Sem número. Exclusão do RDO permitida |
| emitido | `AGUARDANDO_RESPONSAVEL` | Número + PDF; espera o N3 do cabeçalho |
| devolvido | `DEVOLVIDO` | Editável pelo dono; linhas já emitidas não saem |
| aprovado | `LIBERADO` | Entra no Planejamento. Documento imutável |
| lançado | *não é status* | Flags Avanço / DHT |
| arquivado | `ARQUIVADO` | Terminal |

```
(novo) --Emitente cria--> RASCUNHO --Emitente dono emite--> AGUARDANDO_RESPONSAVEL
                                                              |                 |
                                              N3 do cabeçalho devolve           N3 do cabeçalho aprova
                                                              v                 v
                                                          DEVOLVIDO         LIBERADO
                                                              |                 |
                                    Emitente dono reemite     |                 Planejamento arquiva
                                    (mesmo numero, PDF+1)     |                 v
                                                              +------------> ARQUIVADO
```

| De | Para | Quem | Efeito |
|---|---|---|---|
| — | `RASCUNHO` | Emitente | Cria. Insere emitente na equipe (`obrigatorio`). `numero` nulo |
| `RASCUNHO` | `AGUARDANDO_RESPONSAVEL` | Emitente dono | Valida mínimos. Gera `RDO-{ano(emitido_em)}-{seq}`. Snapshots. PDF v1. Marca `incluido_em_versao=1` nas linhas. Encaminha ao N3 do cabeçalho |
| `AGUARDANDO_RESPONSAVEL` | `DEVOLVIDO` | Usuario do `responsavel_lider_id` | Observação obrigatória. `RdoRevisao DEVOLVIDO` |
| `AGUARDANDO_RESPONSAVEL` | `LIBERADO` | Usuario do `responsavel_lider_id` | `RdoRevisao APROVADO`. Cria `RdoPlanejamento`. Encaminha ao Planejamento |
| `DEVOLVIDO` | `AGUARDANDO_RESPONSAVEL` | Emitente dono | Revalida mínimos (e o N3 vigente). PDF vN+1. Número igual. Tipo igual. Linhas novas recebem a nova versão |
| `LIBERADO` | `ARQUIVADO` | Planejamento | Definitivo. Independente de Avanço/DHT |

Ações sem mudança de status:

| Ação | Quem | Quando |
|---|---|---|
| Editar / salvar / excluir RDO | Emitente dono | Só `RASCUNHO` (excluir RDO). Editar também em `DEVOLVIDO` |
| Incluir linha | Emitente dono | `RASCUNHO`, `DEVOLVIDO` |
| Excluir linha | Emitente dono | Só se `incluido_em_versao IS NULL` e, se equipe, `obrigatorio = false` |
| Trocar N3 | Emitente dono | `RASCUNHO` (silencioso) ou `DEVOLVIDO` (histórico `RESPONSAVEL_ALTERADO`) |
| Trocar tipo | Emitente dono | Só `RASCUNHO` |
| Marcar / desmarcar Avanço ou DHT | Planejamento | `LIBERADO` ou `ARQUIVADO` |
| Baixar PDF | Perfis com permissão | Qualquer status com documento; evento `PDF_BAIXADO` |

Quem não dispara transição de RDO: Administrador. Emitente não libera. N3 não arquiva. Planejamento não vê `RASCUNHO`, `AGUARDANDO_RESPONSAVEL` nem `DEVOLVIDO`.

---

## 4. Regras de emissão (mínimos e bloqueios)

Obrigatório para emitir ou reemitir:

1. Cabeçalho completo: data, turno, horários, clima do período, área, fiscal, pacote, N3 com Usuario `RESPONSAVEL` ativo.
2. Tipo já escolhido; após 1ª emissão, inalterado.
3. Pelo menos 1 `RdoServico`.
4. Pelo menos 1 `RdoEquipe` (o emitente, `obrigatorio`).
5. Pelo menos 1 `RdoVisto` (qualquer tipo).
6. Horários de PT em ordem. Entrada/saída da equipe em ordem.
7. `RdoItemExecutado` **não** é obrigatório.
8. Isolamento não preenche etapas de pintura e vice-versa.

Após a 1ª emissão:

- `numero` e `tipo` congelados.
- Linhas com `incluido_em_versao` preenchido não são apagadas.
- Emitente dono não muda.
- N3 pode mudar só em `DEVOLVIDO`.
- Conteúdo de `LIBERADO` / `ARQUIVADO` é imutável (exceto marcadores de planejamento).

---

## 5. Decisões das 14 lacunas (congeladas)

| # | Decisão |
|---|---|
| 1 | Reenvio = mesmo Convite. Novo token, +48h, zera `revogado_em`. 1 convite não aceito por e-mail |
| 2 | Em `DEVOLVIDO`: editar e incluir livre. Não excluir linha já emitida (`incluido_em_versao` not null). Mudança vai ao `RdoHistorico` |
| 3 | Serviços/equipe/itens atualizam no lugar. Versionam `RdoDocumento` e `RdoHistorico` |
| 4 | `AAAA` vem de `emitido_em` |
| 5 | Só o Usuario do `responsavel_lider_id` revisa aquele RDO |
| 6 | Mínimo 1 visto, qualquer tipo |
| 7 | Mínimo 1 serviço e 1 pessoa na equipe. CML opcional. Emitente entra automático e não sai |
| 8 | Tipo imutável após 1ª emissão. N3 trocável em `DEVOLVIDO` com evento no histórico |
| 9 | Avanço/DHT desmarcáveis. Arquivar é definitivo. Arquivar com zero lançamentos permitido |
| 10 | Admin inicial por seed. `funcionario_id` nulo |
| 11 | `LogSeguranca` = conta/acesso/convite. `RdoHistorico` = documento |
| 12 | Um `emitido_por_usuario_id`. Sem co-emitente |
| 13 | `identificacao_equipamento` copia `RdoServico.tag` automaticamente |
| 14 | Cookie opaco (token aleatório em `token_hash`, não JWT). 8h de inatividade, renovável a cada requisição (`expira_em` e `ultimo_uso_em`). Logout/reset/desativação revogam |

---

## 6. Schema gerado

- `schema/001_init.sql` — tipos, tabelas, FKs, índices, checks e triggers.
- `schema/002_seed_admin.sql` — primeiro Administrador (`funcionario_id` nulo). Informar o bcrypt em `SUBSTITUIR_POR_BCRYPT`.
- `schema/003_triggers_invariantes.sql` — tipo imutavel apos emissao e ARQUIVADO definitivo (tambem incluso em `001_init.sql`).

Regras que o SQL garante: 1 convite nao aceito por e-mail; equipe e servico do mesmo RDO; CML ligado ao RDO do servico; etapas isolamento vs pintura; nao apagar linha com `incluido_em_versao`; nao remover integrante `obrigatorio`; tipo imutavel apos emissao; RDO arquivado nao pode ser alterado.

Regras que ficam na aplicacao: so o N3 do cabecalho revisa; sliding de sessao 8h; minimos de emissao; numeracao atomica em `rdo_numeracoes`.
