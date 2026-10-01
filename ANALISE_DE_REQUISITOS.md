# Análise de Requisitos

## Sistema de Registro Diário de Obra (RDO) Digital

**Projeto:** Projeto de extensão - Análise e Desenvolvimento de Sistemas  
**Organização de referência:** Priner - atividades industriais atendidas para a Braskem  
**Escopo inicial:** Disciplina de Acesso por Cordas  
**Data de revisão:** 26 de setembro de 2026  
**Modelo de dados congelado:** `MODELO_DE_DADOS.md` (fonte da verdade do banco; em conflito, vale o modelo).

---

## 1. Visão geral

O Sistema de RDO Digital tem como objetivo digitalizar a emissão, a revisão e o encaminhamento dos Registros Diários de Obra utilizados pela equipe de Acesso por Cordas. Atualmente, as informações do RDO são preenchidas manualmente e encaminhadas ao planejamento, que as utiliza para alimentar outros sistemas.

A aplicação reduzirá o tempo entre a emissão e o recebimento do RDO pelo planejamento, inserindo a revisão do Responsável (N3) antes da liberação, e mantendo os dados organizados, pesquisáveis e rastreáveis.

## 2. Objetivo e escopo

### Objetivo

Permitir que o emitente registre o RDO em ambiente web, gere o documento digital, o envie ao Responsável (N3) para aprovação e, após a liberação, o disponibilize ao planejamento para acompanhamento e lançamento nos sistemas corporativos.

### Escopo do MVP

O MVP atenderá exclusivamente à disciplina de Acesso por Cordas, contemplando RDOs de isolamento e pintura em torres e tubulações.

O sistema deverá permitir:

- Cadastro e controle de usuários, perfis, funcionários, cargos, fiscais, responsáveis líderes, áreas, pacotes e vistos.
- Convite individual, de uso único e com expiração de 48 horas, para contas de Emitente (N2), Responsável (N3) e Planejamento.
- Criação, edição, emissão, revisão pelo N3 (aprovação ou devolução), consulta e arquivamento de RDOs digitais.
- Geração de PDF com estrutura compatível com os modelos atuais de RDO.
- Acompanhamento pelo planejamento dos lançamentos de Avanço e DHT.

## 3. Perfis de acesso

| Perfil | Responsabilidades principais |
|---|---|
| Administrador | Gerencia usuários, cadastros base, perfis de acesso, áreas, fiscais, responsáveis líderes, pacotes, funcionários, cargos e vistos. Envia convites individuais. |
| Emitente | Cria e revisa RDOs, informa serviços e equipe, seleciona vistos cadastrados, emite o documento e o encaminha ao Responsável (N3). Corrige RDOs devolvidos. |
| Responsável (N3) | Recebe RDOs emitidos, revisa o conteúdo e libera para o Planejamento ou devolve ao emitente com observações. |
| Planejamento | Consulta RDOs liberados pelo N3, registra o lançamento em Avanço e/ou DHT e realiza o arquivamento conforme o fluxo definido. |

O acesso ao sistema não será público. Os usuários serão criados ou convidados pelo administrador.

Cada convite é individual, de uso único e expira em 48 horas.

## 4. Tipos de RDO

| Código | Tipo de RDO | Etapas marcáveis e campos específicos do verso |
|---|---|---|
| RDO-IT | Isolamento de torres | Remoção, recomposição isolamento, recomposição funilaria, largura, altura, em andamento, concluído, escopo inicial e abrangência. Identificação: Torre e CML. |
| RDO-ITB | Isolamento de tubulações | Remoção, recomposição isolamento, recomposição funilaria, largura, altura, em andamento, concluído, escopo inicial e abrangência. Identificação: TAG e CML. |
| RDO-PT | Pintura de torres | Tratamento, fundo/intermediária, acabamento, em andamento, concluído, escopo inicial e abrangência. Identificação: Torre e CML. |
| RDO-PTB | Pintura de tubulações | Tratamento, fundo/intermediária, acabamento, em andamento, concluído, escopo inicial e abrangência. Identificação: TAG e CML. |

As etapas técnicas serão campos marcáveis. Quando houver dimensão (isolamento), largura e altura serão registradas em milímetros. A situação do item será exatamente uma entre `Em andamento` e `Concluído`. Escopo inicial e abrangência são textos opcionais em todos os tipos.

## 5. Estrutura do RDO

### 5.1 Frente: campos comuns

- **Cabeçalho:** área, fiscal, condições climáticas, pacote, data, turno, responsável líder (N3), horário geral do serviço.
- **Condições climáticas:** Bom, Nublado ou Chuva para manhã, tarde e noite.
- **Distribuição de efetivo:** função, quantitativo N1, N2, N3 e efetivo total.
- **Tabela de serviços:** item, REC, TAG, número da PT, horários de solicitação, emissão e finalização da PT, efetivo e observações.
- **Relação de efetivo:** matrícula, nome, função, entrada, saída, itens de PT emitidos e itens de serviço executados.
- **Observações:** quadro de observações da Priner e quadro de observações da fiscalização.
- **Vistos:** seleção de vistos previamente cadastrados, sem assinatura eletrônica formal.

### 5.2 Classificação da equipe

| Nível | Descrição | Presença no RDO |
|---|---|---|
| N1 | Executantes de acesso por cordas. | Integram a relação de efetivo. |
| N2 | Encarregados de acesso por cordas. | Integram a relação de efetivo. O emitente do RDO é um N2. |
| N3 | Supervisor geral e responsável líder. | É selecionado no cabeçalho, não integra a relação de efetivo e, com conta de usuário, revisa o RDO após a emissão. |

### 5.3 Verso: itens executados

Cada RDO poderá conter diversos itens executados. Todo item deverá possuir:

- Número sequencial.
- Identificação do equipamento: Torre ou TAG.
- Número CML.
- Situação de andamento ou conclusão.
- Escopo inicial, abrangência e observações.
- Campos técnicos específicos do tipo de serviço.

#### Etapas marcáveis por tipo

**Isolamento (torres e tubulações):**

- Remoção
- Recomposição isolamento
- Recomposição funilaria
- Largura (mm)
- Altura (mm)
- Em andamento
- Concluído
- Escopo inicial
- Abrangência

**Pintura (torres e tubulações):**

- Tratamento
- Fundo/Intermediária
- Acabamento
- Em andamento
- Concluído
- Escopo inicial
- Abrangência

## 6. Requisitos funcionais

| ID | Requisito |
|---|---|
| RF01 | Permitir login, recuperação de senha e controle de sessão dos usuários autorizados. |
| RF02 | Permitir ao administrador cadastrar e manter usuários, funcionários, cargos, áreas, fiscais, responsáveis líderes, pacotes e vistos. |
| RF03 | Permitir ao administrador enviar convite individual, de uso único e com expiração de 48 horas, para Emitente (N2), Responsável (N3) e Planejamento. |
| RF04 | Permitir a criação de RDO para um dos quatro tipos de serviço definidos no escopo. |
| RF05 | Preencher automaticamente a disciplina conforme o tipo de RDO selecionado. |
| RF06 | Registrar condições climáticas de manhã, tarde e noite com as opções Bom, Nublado ou Chuva. |
| RF07 | Registrar múltiplos serviços em um RDO, com REC, TAG, PT, horários, efetivo e observações. |
| RF08 | Registrar funcionários e relacioná-los a um ou mais itens de serviço e/ou itens de PT emitida. |
| RF09 | Calcular o efetivo total e a distribuição N1/N2 a partir da relação de efetivo; selecionar o N3 como responsável líder. |
| RF10 | Permitir marcar etapas técnicas conforme o tipo de RDO e registrar dimensões em milímetros quando aplicável. |
| RF11 | Permitir registrar observações da Priner e da fiscalização. |
| RF12 | Permitir selecionar vistos previamente cadastrados, sem coleta de assinatura eletrônica formal. |
| RF13 | Permitir salvar RDO como rascunho, emitir, consultar o histórico e reemitir RDOs devolvidos. |
| RF14 | Gerar PDF do RDO com frente e verso compatíveis com os modelos operacionais. |
| RF15 | Encaminhar o RDO emitido ao Responsável (N3) selecionado no cabeçalho e notificá-lo. |
| RF16 | Permitir ao Responsável (N3) revisar o RDO, liberá-lo para o Planejamento ou devolvê-lo ao emitente com observações. |
| RF17 | Permitir ao planejamento marcar os campos Lançado Avanço e Lançado DHT. |
| RF18 | Permitir o arquivamento do RDO digital; o campo Escaneado não será utilizado. |
| RF19 | Pesquisar RDOs por número, data, tipo, área, pacote, REC, TAG, PT, CML e status. |
| RF20 | Gerar número sequencial e imutável para o RDO no momento da primeira emissão, seguindo inicialmente o padrão `RDO-AAAA-NNNNNN`. |

## 7. Regras de negócio

1. Um RDO será associado a somente um tipo de serviço, mas poderá possuir vários serviços e vários itens executados.
2. Um funcionário poderá estar relacionado a mais de um serviço e poderá ser emitente de mais de uma PT no mesmo RDO.
3. As referências impressas na relação de efetivo utilizarão o número do item da tabela de serviços. O sistema deverá gerar essas referências automaticamente no PDF.
4. O responsável líder será um profissional N3 e não fará parte da relação de efetivo N1/N2. Esse N3 deverá possuir conta de usuário com perfil Responsável para revisar o RDO.
5. Os horários da PT deverão obedecer à sequência lógica: solicitação, emissão/liberação e encerramento.
6. Na primeira emissão, o RDO recebe número definitivo (`RDO-AAAA-NNNNNN`, ano de `emitido_em`). O tipo do RDO fica imutável. Exclusão do RDO inteiro só ocorre em rascunho. Após emitido, o PDF oficial daquela versão é imutável; correções após devolução do N3 atualizam as linhas no lugar, geram novo PDF (versão+1) e registram as mudanças no histórico, sem alterar o número.
7. Após a emissão, o RDO segue para o Usuario vinculado ao responsável líder (N3) do cabeçalho, não diretamente para o Planejamento. Nenhum outro N3 revisa aquele RDO.
8. O Responsável (N3) do cabeçalho aprova e libera o RDO para o Planejamento, ou devolve ao emitente com observações. Somente RDOs liberados aparecem na caixa de entrada do Planejamento.
9. RDO devolvido volta a ser editável pelo emitente original (único dono). Ele pode alterar campos, incluir linhas e trocar o N3 do cabeçalho. Linhas já presentes na versão emitida não podem ser excluídas. O emitente N2 entra automático na equipe e não pode ser removido. Ao reemitir, nova revisão do N3 vigente é exigida e um novo PDF é gerado.
10. O planejamento marca Lançado Avanço e Lançado DHT (desmarcáveis para correção) e Arquivado (definitivo, permitido com zero lançamentos), apenas em RDOs liberados ou já arquivados (marcadores).
11. Convite de Emitente vincula-se somente a funcionário N2 ativo. Convite de Responsável vincula-se somente a funcionário N3 ativo. Convite de Planejamento não exige vínculo com funcionário. Reenvio atualiza o mesmo convite (novo token, +48h). Há no máximo um convite não aceito por e-mail.
12. Há um único emitente dono por RDO (`emitido_por_usuario_id`). Sem co-emitente.
13. Na emissão/reemissão: mínimo 1 serviço, 1 pessoa na equipe e 1 visto (qualquer tipo). Itens executados (CML) são opcionais. `identificacao_equipamento` do verso copia o TAG do serviço.

## 8. Fluxo operacional proposto

| Etapa | Responsável | Resultado |
|---|---|---|
| 1. Preparação da base | Administrador | Cadastra funcionários (matrícula e nível N1/N2/N3), cargos, áreas, fiscais, pacotes e vistos. Envia convites para Emitente (N2), Responsável (N3) e Planejamento. |
| 2. Ativação da conta | Emitente / Responsável / Planejamento | Recebe o convite, acessa o link, cria a senha e faz login. |
| 3. Preenchimento | Emitente | Seleciona o tipo de RDO, preenche cabeçalho, serviços, equipe, itens executados e observações. |
| 4. Rascunho | Emitente | O RDO pode ser salvo para continuidade ou revisão antes da emissão. |
| 5. Emissão | Emitente | O sistema atribui numeração definitiva (na primeira emissão), congela snapshots, gera o PDF e envia o RDO ao Responsável (N3). |
| 6. Revisão N3 | Responsável (N3) | Revisa o RDO. Se de acordo, libera para o Planejamento. Se não, devolve ao emitente com observações. |
| 7. Correção (se devolvido) | Emitente | Ajusta o RDO conforme as observações e reemite, retornando à etapa 6. |
| 8. Encaminhamento | Sistema | O RDO liberado aparece automaticamente na caixa de entrada do Planejamento. |
| 9. Lançamentos | Planejamento | O planejamento registra Lançado Avanço e/ou Lançado DHT quando concluir cada atividade externa. |
| 10. Arquivamento | Planejamento | O RDO é arquivado digitalmente após o encerramento do tratamento administrativo. |

### Fluxo em uma linha

Admin cadastra + convida → Emitente ativa conta → preenche RDO (cabeçalho → serviços → equipe → itens) → rascunho ou emite (nº definitivo + PDF) → RDO chega na caixa do Responsável N3 → N3 aprova ou devolve ao emitente com ressalvas → se liberado, vai para o Planejamento → Planejamento lança Avanço/DHT → arquiva.

## 9. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | Aplicação web responsiva, utilizável em computadores e tablets em ambiente administrativo. |
| RNF02 | Proteção de acesso por autenticação, senhas armazenadas de forma segura e permissões por perfil. |
| RNF03 | Rastreabilidade de emissão, revisão N3, encaminhamento, lançamentos e arquivamento, com usuário e data/hora. |
| RNF04 | Geração de PDF legível e compatível com o padrão do RDO atualmente utilizado. |
| RNF05 | Armazenamento estruturado dos dados para permitir buscas e futura expansão a outras disciplinas. |
| RNF06 | Não utilizar fotos ou anexos no MVP, devido à restrição de uso de celular nas áreas operacionais. |

## 10. Itens fora do escopo inicial e evolução futura

- Assinatura eletrônica formal e fluxo de aprovação por cliente.
- Envio de fotos e anexos de campo.
- Integração automática com os sistemas de Avanço e DHT.
- Indicadores de produtividade por funcionário, área, serviço ou período.
- Ampliação do sistema para outras disciplinas da empresa.
- Notificação por e-mail além do convite de conta (a revisão N3 usa caixa de entrada no sistema).

## 11. Modelo Entidade-Relacionamento (DER)

O modelo abaixo representa a versão do banco de dados com o perfil Responsável (N3) e o ciclo de revisão. Os nomes estão em singular e podem ser adaptados à convenção escolhida no desenvolvimento.

```mermaid
erDiagram
    USUARIO {
        uuid id PK
        string nome
        string email UK
        string senha_hash
        enum perfil
        boolean ativo
        datetime criado_em
    }
    CONVITE {
        uuid id PK
        string email
        enum perfil_destino
        string token_hash
        datetime expira_em
        datetime aceito_em
    }
    FUNCIONARIO {
        uuid id PK
        string matricula UK
        string nome
        enum nivel_acesso
        boolean ativo
    }
    CARGO {
        uuid id PK
        string nome
        boolean ativo
    }
    AREA {
        uuid id PK
        string nome
        boolean ativa
    }
    FISCAL {
        uuid id PK
        string nome
        boolean ativo
    }
    PACOTE {
        uuid id PK
        string nome
        boolean ativo
    }
    RDO {
        uuid id PK
        string numero UK
        enum tipo
        enum status
        date data_servico
        enum turno
        time inicio_servico
        time fim_servico
        enum clima_manha
        enum clima_tarde
        enum clima_noite
        text observacao_priner
        text observacao_fiscalizacao
        datetime emitido_em
        datetime liberado_em
    }
    RDO_SERVICO {
        uuid id PK
        int numero_item
        string rec
        string tag
        string numero_pt
        time pt_solicitada_em
        time pt_liberada_em
        time pt_encerrada_em
        int efetivo_informado
        text observacao
    }
    RDO_EQUIPE {
        uuid id PK
        time horario_entrada
        time horario_saida
    }
    RDO_EQUIPE_SERVICO {
        uuid id PK
        boolean emitente_pt
    }
    ITEM_EXECUTADO {
        uuid id PK
        int numero_item
        string identificacao_equipamento
        string cml
        boolean remocao
        boolean recomposicao_isolamento
        boolean recomposicao_funilaria
        boolean tratamento
        boolean fundo_intermediaria
        boolean acabamento
        decimal largura_mm
        decimal altura_mm
        enum situacao
        string escopo_inicial
        string abrangencia
        text observacao
    }
    VISTO_CADASTRADO {
        uuid id PK
        string nome_responsavel
        enum tipo_visto
        boolean ativo
    }
    RDO_VISTO {
        uuid id PK
        string tipo_visto
        string nome_responsavel_snapshot
        datetime registrado_em
    }
    RDO_REVISAO {
        uuid id PK
        enum decisao
        text observacao
        datetime ocorrido_em
    }
    RDO_PLANEJAMENTO {
        uuid id PK
        datetime lancado_avanco_em
        datetime lancado_dht_em
        datetime arquivado_em
    }
    RDO_DOCUMENTO {
        uuid id PK
        string nome_arquivo
        string caminho_armazenamento
        string checksum
        datetime gerado_em
    }
    RDO_HISTORICO {
        uuid id PK
        enum evento
        string detalhes
        datetime ocorrido_em
    }

    CARGO ||--o{ FUNCIONARIO : classifica
    FUNCIONARIO o|--o| USUARIO : vincula
    USUARIO ||--o{ CONVITE : envia
    AREA ||--o{ RDO : referencia
    FISCAL ||--o{ RDO : fiscaliza
    PACOTE ||--o{ RDO : compoe
    FUNCIONARIO ||--o{ RDO : lidera_N3
    USUARIO ||--o{ RDO : emite
    RDO ||--|{ RDO_SERVICO : possui
    RDO ||--|{ RDO_EQUIPE : registra
    FUNCIONARIO ||--o{ RDO_EQUIPE : participa
    RDO_EQUIPE ||--|{ RDO_EQUIPE_SERVICO : atua_em
    RDO_SERVICO ||--o{ RDO_EQUIPE_SERVICO : recebe_equipe
    RDO_SERVICO ||--o{ ITEM_EXECUTADO : detalha
    RDO ||--o{ RDO_VISTO : registra
    VISTO_CADASTRADO ||--o{ RDO_VISTO : referencia
    RDO ||--o{ RDO_REVISAO : revisado_por_n3
    USUARIO ||--o{ RDO_REVISAO : revisa
    RDO ||--|| RDO_PLANEJAMENTO : acompanha
    RDO ||--o{ RDO_DOCUMENTO : gera
    RDO ||--o{ RDO_HISTORICO : possui
    USUARIO ||--o{ RDO_HISTORICO : executa
```

### 11.1 Entidades principais

| Entidade | Finalidade |
|---|---|
| `USUARIO` | Credencial de acesso ao sistema. Tem um dos perfis: Administrador, Emitente, Responsável ou Planejamento. |
| `CONVITE` | Controla o convite individual enviado pelo administrador. O token é armazenado somente como hash, com validade de 48 horas e uso único. Destinos: Emitente, Responsável ou Planejamento. |
| `FUNCIONARIO` e `CARGO` | Dados operacionais da equipe, incluindo matrícula, função e nível de acesso por cordas: N1, N2 ou N3. |
| `AREA`, `FISCAL` e `PACOTE` | Cadastros reutilizáveis do cabeçalho do RDO. |
| `RDO` | Registro principal: cabeçalho, tipo, clima, data, turno, observações e status. |
| `RDO_SERVICO` | Linhas da tabela de serviços: REC, TAG, PT, horários, efetivo e observação. |
| `RDO_EQUIPE` | Relação de funcionários presentes no RDO, com horário de entrada e saída. |
| `RDO_EQUIPE_SERVICO` | Vínculo entre cada integrante e cada serviço. Permite indicar tanto os serviços executados quanto se a pessoa foi emitente da PT daquele item. |
| `ITEM_EXECUTADO` | Linhas do verso: equipamento, CML, etapas marcáveis (incluindo recomposição isolamento/funilaria e fundo/intermediária), dimensões em milímetros, situação, escopo inicial, abrangência e observações. |
| `VISTO_CADASTRADO` e `RDO_VISTO` | Cadastro de vistos e cópia do visto selecionado para o RDO emitido. |
| `RDO_REVISAO` | Cada decisão do Responsável (N3): aprovação/liberação ou devolução com observações. Permite múltiplos ciclos. |
| `RDO_PLANEJAMENTO` | Registro dos lançamentos em Avanço, DHT e arquivamento. |
| `RDO_DOCUMENTO` | Metadados do PDF gerado, incluindo localização e código de integridade do arquivo. Uma nova emissão após devolução gera novo documento. |
| `RDO_HISTORICO` | Trilha de auditoria de ações relevantes, com usuário, data/hora e detalhe. |

### 11.2 Relações críticas

1. **Serviço, TAG e itens executados:** cada linha de `RDO_SERVICO` representa a atuação em um equipamento identificado pelo seu TAG, além de concentrar REC, PT e seus horários. Os registros de `ITEM_EXECUTADO` (CMLs) pertencem a essa linha de serviço, mantendo o detalhamento técnico do verso ligado ao equipamento e à PT corretos.
2. **Funcionário, serviço e PT:** um funcionário integra um RDO por `RDO_EQUIPE` e pode se relacionar a vários itens da tabela de serviços por `RDO_EQUIPE_SERVICO`. A marca `emitente_pt` identifica se ele é emitente da PT daquele item. Assim, o PDF poderá mostrar automaticamente referências como `1, 2` nos campos “Emitente PT” e “Nº Serviço”.
3. **Emitente do RDO:** o usuário que cria o RDO é sempre registrado. Na regra usual, esse usuário também estará vinculado a um funcionário N2 e será incluído automaticamente na equipe do RDO; o sistema deve permitir ajuste apenas a usuários autorizados.
4. **Responsável líder e revisor N3:** o RDO referencia um funcionário N3 no cabeçalho. Esse N3 não compõe a relação de efetivo N1/N2. A revisão após a emissão é feita pelo usuário com perfil Responsável vinculado a esse funcionário N3.
5. **Dados históricos:** ao emitir um RDO, os nomes e dados exibidos no documento devem ser gravados como cópia no próprio RDO ou em suas relações. Alterações futuras no cadastro de funcionário, fiscal, área ou pacote não podem modificar RDOs já emitidos ou liberados. Reemissão após devolução atualiza os snapshots da nova versão e preserva o histórico anterior.
6. **Revisão N3:** cada aprovação ou devolução gera um registro em `RDO_REVISAO` e um evento em `RDO_HISTORICO`. A observação da devolução fica visível ao emitente.
7. **Planejamento:** os registros “Lançado Avanço”, “Lançado DHT” e “Arquivado” só se aplicam a RDOs com status `LIBERADO` ou `ARQUIVADO`. Devem registrar o usuário responsável no histórico, além das datas apresentadas na tela.
8. **Documento oficial:** a emissão gera um PDF salvo no sistema. O download é apenas uma cópia local; o documento armazenado no sistema continua sendo a fonte oficial para consultas futuras. Após a liberação pelo N3, o PDF da versão liberada é imutável.

### 11.3 Estados do RDO

| Estado | Descrição | Quem pode alterar |
|---|---|---|
| `RASCUNHO` | RDO em preenchimento, ainda sem numeração definitiva. | Emitente responsável. |
| `AGUARDANDO_RESPONSAVEL` | RDO emitido, numerado, com PDF gerado, aguardando revisão do N3. | Sistema, mediante ação do Responsável (N3). |
| `DEVOLVIDO` | N3 devolveu o RDO ao emitente com observações. Editável: campos, inclusão de linhas e troca do N3. Linhas já emitidas não são excluídas. | Emitente dono (edição e reemissão). |
| `LIBERADO` | N3 do cabeçalho aprovou; o RDO está na caixa de entrada do Planejamento. Conteúdo imutável. | Planejamento (marcadores, inclusive desmarcar Avanço/DHT, e arquivamento definitivo). |
| `ARQUIVADO` | Processo administrativo encerrado; o documento permanece disponível para consulta e download. | Planejamento. |

Os eventos de Avanço e DHT não precisam criar estados isolados: eles são marcadores independentes registrados no módulo de planejamento. Dessa forma, um RDO poderá estar liberado ou arquivado, tendo Avanço, DHT, ambos ou nenhum lançamento marcado.

Transições permitidas:

- `RASCUNHO` → `AGUARDANDO_RESPONSAVEL` (emitir)
- `AGUARDANDO_RESPONSAVEL` → `LIBERADO` (N3 aprova)
- `AGUARDANDO_RESPONSAVEL` → `DEVOLVIDO` (N3 devolve)
- `DEVOLVIDO` → `AGUARDANDO_RESPONSAVEL` (emitente reemite)
- `LIBERADO` → `ARQUIVADO` (Planejamento arquiva)

## 12. Modelo lógico do banco de dados

O modelo lógico transforma o DER em tabelas, colunas, chaves e restrições que poderão ser implementadas no PostgreSQL. Ele separa os dados de cadastro dos dados históricos do RDO, para que relatórios já emitidos nunca sejam alterados por mudanças posteriores nos cadastros.

### 12.1 Convenções adotadas

| Convenção | Decisão |
|---|---|
| Identificadores | Todas as tabelas usam `id` do tipo `UUID` como chave primária. |
| Datas e horas | Datas e horas relevantes usam `TIMESTAMP WITH TIME ZONE`. O PDF exibirá somente a parte necessária, como data ou horário. Essa escolha permite tratar corretamente turnos que terminam após meia-noite. |
| Exclusão | Cadastros utilizam `ativo = false`; não devem ser apagados fisicamente quando já tiverem sido usados em RDO. Exclusão de linhas de RDO só é permitida em `RASCUNHO`. |
| Dados históricos | Dados exibidos em RDO emitido são guardados como cópia (`snapshot`) nas tabelas do RDO. |
| Perfis e status | Valores fechados usam `ENUM` ou `CHECK`, evitando grafias diferentes para o mesmo dado. |
| Senhas e convites | Somente hashes são gravados. Senha e token de convite nunca são armazenados em texto simples. |
| Fuso horário | Datas devem ser gravadas no fuso `America/Sao_Paulo` e convertidas pelo servidor quando necessário. |

### 12.2 Tabelas de acesso e convites

#### `usuarios`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `funcionario_id` | UUID | FK para `funcionarios`; nulo para usuários de Planejamento sem vínculo com funcionário; único quando informado. Obrigatório para Emitente (N2) e Responsável (N3). |
| `nome` | VARCHAR(120) | Obrigatório. |
| `email` | VARCHAR(254) | Obrigatório, único e armazenado em minúsculas. |
| `senha_hash` | VARCHAR(255) | Obrigatório após aceitação do convite. |
| `perfil` | ENUM | `ADMINISTRADOR`, `EMITENTE`, `RESPONSAVEL` ou `PLANEJAMENTO`. |
| `ativo` | BOOLEAN | Padrão `true`. |
| `ultimo_login_em` | TIMESTAMPTZ | Nulo até o primeiro acesso. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

#### `convites`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `enviado_por_usuario_id` | UUID | FK para `usuarios`; obrigatório. |
| `email` | VARCHAR(254) | Obrigatório. |
| `perfil_destino` | ENUM | `EMITENTE`, `RESPONSAVEL` ou `PLANEJAMENTO`; cadastro de administrador será controlado internamente. |
| `funcionario_id` | UUID | FK opcional para `funcionarios`; obrigatório quando o convite for de Emitente (N2) ou Responsável (N3). |
| `token_hash` | VARCHAR(255) | Obrigatório e único. |
| `expira_em` | TIMESTAMPTZ | Obrigatório; 48 horas após a criação. |
| `aceito_em` / `revogado_em` | TIMESTAMPTZ | Nulos até que o evento ocorra. |
| `criado_em` | TIMESTAMPTZ | Obrigatório. |

### 12.3 Tabelas de cadastros operacionais

#### `cargos`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `nome` | VARCHAR(100) | Obrigatório e único entre os ativos. |
| `ativo` | BOOLEAN | Padrão `true`. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

#### `funcionarios`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `matricula` | VARCHAR(30) | Obrigatória e única. |
| `nome` | VARCHAR(150) | Obrigatório. |
| `cargo_id` | UUID | FK para `cargos`; obrigatório. |
| `nivel_acesso` | ENUM | `N1`, `N2` ou `N3`; obrigatório. |
| `ativo` | BOOLEAN | Padrão `true`. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

#### `areas`, `fiscais` e `pacotes`

Esses três cadastros seguem a mesma estrutura, mudando apenas o nome da tabela.

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `nome` | VARCHAR(150) | Obrigatório; único entre os registros ativos. |
| `ativo` | BOOLEAN | Padrão `true`. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

Exemplos iniciais de pacote podem ser `Insp PGM`, `RBI` e `CSI`; o administrador poderá incluir ou desativar opções sem alterar o código.

#### `vistos_cadastrados`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `nome_responsavel` | VARCHAR(150) | Obrigatório. |
| `tipo_visto` | ENUM | `ENCARREGADO`, `SUPERVISOR` ou `CLIENTE`. |
| `ativo` | BOOLEAN | Padrão `true`. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

### 12.4 Tabela principal do RDO

#### `rdos`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `numero` | VARCHAR(20) | Único; nulo enquanto estiver em rascunho; obrigatório após a primeira emissão. Ex.: `RDO-2026-000001`. Não muda em reemissões. |
| `disciplina` | ENUM | No MVP, valor fixo `ACESSO_POR_CORDAS`; preserva a possibilidade de expansão futura. |
| `tipo` | ENUM | `ISOLAMENTO_TORRES`, `ISOLAMENTO_TUBULACOES`, `PINTURA_TORRES` ou `PINTURA_TUBULACOES`. |
| `status` | ENUM | `RASCUNHO`, `AGUARDANDO_RESPONSAVEL`, `DEVOLVIDO`, `LIBERADO` ou `ARQUIVADO`. |
| `data_servico` | DATE | Obrigatória na emissão. |
| `turno` | ENUM | Inicialmente `DIURNO` ou `NOTURNO`. |
| `inicio_servico_em` / `fim_servico_em` | TIMESTAMPTZ | Horário geral do serviço; obrigatórios na emissão. |
| `clima_manha`, `clima_tarde`, `clima_noite` | ENUM | `BOM`, `NUBLADO` ou `CHUVA`; podem ficar nulos quando o período não fizer parte do turno. |
| `area_id`, `fiscal_id`, `pacote_id` | UUID | FKs para os cadastros correspondentes; obrigatórias na emissão. |
| `responsavel_lider_id` | UUID | FK para `funcionarios`; deve indicar profissional N3 com usuário ativo de perfil `RESPONSAVEL`. |
| `emitido_por_usuario_id` | UUID | FK para `usuarios`; obrigatório. |
| `observacao_priner` | TEXT | Opcional. |
| `observacao_fiscalizacao` | TEXT | Opcional. |
| `area_nome_snapshot`, `fiscal_nome_snapshot`, `pacote_nome_snapshot` | VARCHAR(150) | Cópias dos nomes exibidos no RDO quando ele é emitido. |
| `responsavel_lider_nome_snapshot` | VARCHAR(150) | Cópia do nome do N3 no momento da emissão. |
| `emitido_em` | TIMESTAMPTZ | Nulo em rascunho e obrigatório após a primeira emissão. |
| `liberado_em` | TIMESTAMPTZ | Nulo até a aprovação do N3. |
| `liberado_por_usuario_id` | UUID | FK para `usuarios`; obrigatório quando liberado. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

### 12.5 Serviços, equipe e PTs

#### `rdo_servicos`

Cada registro corresponde a uma linha da tabela de serviços e ao equipamento identificado pelo TAG.

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório. |
| `numero_item` | SMALLINT | Obrigatório e único dentro do mesmo RDO. |
| `rec` | VARCHAR(60) | Obrigatório na emissão. |
| `tag` | VARCHAR(100) | Obrigatório na emissão; identifica a torre ou tubulação atendida. |
| `numero_pt` | VARCHAR(60) | Obrigatório na emissão. |
| `pt_solicitada_em`, `pt_liberada_em`, `pt_encerrada_em` | TIMESTAMPTZ | Obrigatórios na emissão; devem respeitar a ordem cronológica. |
| `observacao` | TEXT | Opcional. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

**Restrição:** `UNIQUE (rdo_id, numero_item)`.

O efetivo de cada serviço não será armazenado como número manual. Ele será calculado a partir dos funcionários vinculados ao serviço por `rdo_equipe_servicos`.

#### `rdo_equipes`

Registra uma pessoa presente no RDO e preserva seus dados para fins históricos.

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório. |
| `funcionario_id` | UUID | FK para `funcionarios`; obrigatório. |
| `matricula_snapshot` | VARCHAR(30) | Obrigatória na emissão. |
| `nome_snapshot` | VARCHAR(150) | Obrigatória na emissão. |
| `cargo_nome_snapshot` | VARCHAR(100) | Obrigatória na emissão. |
| `nivel_acesso_snapshot` | ENUM | `N1` ou `N2`; N3 não integra a relação de efetivo. |
| `entrada_em` / `saida_em` | TIMESTAMPTZ | Obrigatórios na emissão. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

**Restrição:** `UNIQUE (rdo_id, funcionario_id)`.

#### `rdo_equipe_servicos`

Tabela de ligação que permite vários funcionários em vários serviços/PTs.

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_equipe_id` | UUID | FK para `rdo_equipes`; obrigatório. |
| `rdo_servico_id` | UUID | FK para `rdo_servicos`; obrigatório. |
| `emitente_pt` | BOOLEAN | Padrão `false`; `true` quando o funcionário foi emitente da PT daquele serviço. |
| `criado_em` | TIMESTAMPTZ | Auditoria técnica. |

**Restrição:** `UNIQUE (rdo_equipe_id, rdo_servico_id)`.

### 12.6 Itens executados do verso

#### `rdo_itens_executados`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório. |
| `rdo_servico_id` | UUID | FK para `rdo_servicos`; obrigatório. O serviço deve pertencer ao mesmo RDO. |
| `numero_item` | SMALLINT | Obrigatório e único dentro do RDO; corresponde à linha do verso. |
| `identificacao_equipamento` | VARCHAR(100) | Obrigatória; recebe Torre ou TAG conforme o tipo de RDO. |
| `cml` | VARCHAR(80) | Obrigatório na emissão. |
| `remocao` | BOOLEAN | Isolamento. |
| `recomposicao_isolamento` | BOOLEAN | Isolamento. Substitui o campo único `recomposicao`. |
| `recomposicao_funilaria` | BOOLEAN | Isolamento. |
| `tratamento` | BOOLEAN | Pintura. |
| `fundo_intermediaria` | BOOLEAN | Pintura. Etapa única Fundo/Intermediária. |
| `acabamento` | BOOLEAN | Pintura. |
| `largura_mm` / `altura_mm` | NUMERIC(12,2) | Apenas para isolamento; valores positivos em milímetros. |
| `situacao` | ENUM | `EM_ANDAMENTO` ou `CONCLUIDO`; obrigatória na emissão. |
| `escopo_inicial` | VARCHAR(150) | Opcional. |
| `abrangencia` | VARCHAR(150) | Opcional. |
| `observacao` | TEXT | Opcional. |
| `criado_em` / `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

**Restrições:**

- `UNIQUE (rdo_id, numero_item)`.
- Um item de isolamento não pode preencher etapas exclusivas de pintura (`tratamento`, `fundo_intermediaria`, `acabamento`).
- Um item de pintura não pode preencher remoção, recomposições, largura ou altura.
- `largura_mm > 0` e `altura_mm > 0` quando informadas.
- `situacao` é mutuamente exclusiva: exatamente um valor entre `EM_ANDAMENTO` e `CONCLUIDO`.

### 12.7 Vistos, revisão N3, planejamento, documentos e auditoria

#### `rdo_vistos`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório. |
| `visto_cadastrado_id` | UUID | FK para `vistos_cadastrados`; obrigatório. |
| `tipo_visto` | ENUM | Cópia do tipo selecionado. |
| `nome_responsavel_snapshot` | VARCHAR(150) | Cópia do nome selecionado. |
| `registrado_por_usuario_id` | UUID | FK para `usuarios`; obrigatório. |
| `registrado_em` | TIMESTAMPTZ | Obrigatório. |

**Restrição:** `UNIQUE (rdo_id, tipo_visto)`; haverá no máximo um visto de cada tipo por RDO.

#### `rdo_revisoes`

Cada ciclo de revisão do Responsável (N3).

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório. |
| `revisor_usuario_id` | UUID | FK para `usuarios`; obrigatório; perfil `RESPONSAVEL`. |
| `decisao` | ENUM | `APROVADO` ou `DEVOLVIDO`. |
| `observacao` | TEXT | Obrigatória quando `decisao = DEVOLVIDO`; opcional na aprovação. |
| `ocorrido_em` | TIMESTAMPTZ | Obrigatório. |

O RDO pode ter várias revisões ao longo do tempo. A decisão vigente é a mais recente.

#### `rdo_planejamentos`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório e único. |
| `lancado_avanco_em` | TIMESTAMPTZ | Nulo até o lançamento. |
| `lancado_avanco_por_usuario_id` | UUID | FK para `usuarios`; obrigatório quando houver lançamento em Avanço. |
| `lancado_dht_em` | TIMESTAMPTZ | Nulo até o lançamento. |
| `lancado_dht_por_usuario_id` | UUID | FK para `usuarios`; obrigatório quando houver lançamento em DHT. |
| `arquivado_em` | TIMESTAMPTZ | Nulo até o arquivamento. |
| `arquivado_por_usuario_id` | UUID | FK para `usuarios`; obrigatório quando arquivado. |
| `atualizado_em` | TIMESTAMPTZ | Auditoria técnica. |

Criado automaticamente quando o N3 libera o RDO.

#### `rdo_documentos`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório. |
| `tipo` | ENUM | No MVP: `PDF_EMITIDO`. |
| `versao` | SMALLINT | Incrementa a cada emissão/reemissão; a maior versão é a vigente. |
| `nome_arquivo` | VARCHAR(255) | Obrigatório. |
| `chave_armazenamento` | VARCHAR(500) | Obrigatória; referência interna do armazenamento, não uma URL pública. |
| `checksum_sha256` | CHAR(64) | Obrigatório; verifica integridade do arquivo. |
| `gerado_em` | TIMESTAMPTZ | Obrigatório. |
| `gerado_por_usuario_id` | UUID | FK para `usuarios`; obrigatório. |

#### `rdo_historicos`

| Coluna | Tipo | Regras |
|---|---|---|
| `id` | UUID | PK. |
| `rdo_id` | UUID | FK para `rdos`; obrigatório. |
| `usuario_id` | UUID | FK para `usuarios`; pode ser nulo apenas em evento automático do sistema. |
| `evento` | ENUM | `CRIADO`, `ATUALIZADO`, `EMITIDO`, `PDF_GERADO`, `ENCAMINHADO_RESPONSAVEL`, `APROVADO_RESPONSAVEL`, `DEVOLVIDO_RESPONSAVEL`, `REEMITIDO`, `ENCAMINHADO_PLANEJAMENTO`, `LANCADO_AVANCO`, `LANCADO_DHT`, `ARQUIVADO`, `PDF_BAIXADO`. |
| `detalhes` | JSONB | Informações necessárias para auditoria, sem senha, token ou outros segredos. Na devolução, inclui o texto das observações. |
| `ocorrido_em` | TIMESTAMPTZ | Obrigatório. |

## 13. Dicionário de dados e regras de validação

### 13.1 Dados do cabeçalho

| Campo apresentado | Origem | Obrigatório na emissão | Regra de validação |
|---|---|---:|---|
| Área | `rdos.area_id` | Sim | Deve apontar para área ativa. |
| Fiscal | `rdos.fiscal_id` | Sim | Deve apontar para fiscal ativo. |
| Pacote | `rdos.pacote_id` | Sim | Deve apontar para pacote ativo. |
| Data | `rdos.data_servico` | Sim | Data válida; utilizada para a numeração anual e PDF. |
| Turno | `rdos.turno` | Sim | `DIURNO` ou `NOTURNO`. |
| Início e término do serviço | `rdos.inicio_servico_em`, `rdos.fim_servico_em` | Sim | Término deve ocorrer após início; pode passar da meia-noite. |
| Responsável líder | `rdos.responsavel_lider_id` | Sim | Funcionário ativo com nível N3 e usuário ativo de perfil `RESPONSAVEL`. |
| Clima por período | `rdos.clima_*` | Conforme período do turno | Somente Bom, Nublado ou Chuva. |

### 13.2 Dados da tabela de serviços

| Campo apresentado | Origem | Obrigatório na emissão | Regra de validação |
|---|---|---:|---|
| Item | `rdo_servicos.numero_item` | Sim | Sequencial e único no RDO. |
| REC | `rdo_servicos.rec` | Sim | Texto padronizado, até 60 caracteres. |
| TAG | `rdo_servicos.tag` | Sim | Identifica o equipamento — torre ou tubulação — atendido pelo serviço. |
| Nº da PT | `rdo_servicos.numero_pt` | Sim | Texto padronizado, até 60 caracteres. |
| Solicitação, liberação e encerramento da PT | `rdo_servicos.pt_*_em` | Sim | Ordem cronológica obrigatória. |
| Efetivo | Calculado | Sim | Contagem de funcionários vinculados ao item; não é digitado manualmente. |
| Observações | `rdo_servicos.observacao` | Não | Texto livre. |

### 13.3 Relação de efetivo

| Campo apresentado | Origem | Regra |
|---|---|---|
| Matrícula, nome, função e nível | `rdo_equipes.*_snapshot` | Preenchidos a partir do funcionário selecionado e congelados quando o RDO é emitido. |
| Entrada e saída | `rdo_equipes.entrada_em`, `rdo_equipes.saida_em` | Saída deve ocorrer após entrada, inclusive em turno noturno. |
| Emitente PT | `rdo_equipe_servicos.emitente_pt` | O PDF lista os números dos itens em que `emitente_pt = true`. |
| Nº serviço | `rdo_equipe_servicos` | O PDF lista os números dos itens aos quais a pessoa está vinculada. |
| N1 e N2 | `rdo_equipes.nivel_acesso_snapshot` | Integram a relação de efetivo. |
| N3 | `rdos.responsavel_lider_id` | É exibido no cabeçalho e não integra a relação de efetivo. |
| Efetivo total | Calculado | N1 + N2 + 1 responsável N3. |

### 13.4 Dados do verso

| Campo apresentado | RDO de isolamento | RDO de pintura |
|---|---|---|
| Torre ou TAG | Obrigatório; vinculado ao serviço selecionado. | Obrigatório; vinculado ao serviço selecionado. |
| Nº CML | Obrigatório. | Obrigatório. |
| Remoção | Etapa marcável. | Não se aplica. |
| Recomposição isolamento | Etapa marcável. | Não se aplica. |
| Recomposição funilaria | Etapa marcável. | Não se aplica. |
| Largura e altura | Valores positivos em milímetros, quando aplicáveis. | Não se aplica. |
| Tratamento | Não se aplica. | Etapa marcável. |
| Fundo/Intermediária | Não se aplica. | Etapa marcável única. |
| Acabamento | Não se aplica. | Etapa marcável. |
| Andamento ou concluído | Uma situação obrigatória. | Uma situação obrigatória. |
| Escopo inicial, abrangência e observações | Texto opcional. | Texto opcional. |

### 13.5 Dados da revisão N3

| Campo apresentado | Origem | Regra |
|---|---|---|
| Decisão | `rdo_revisoes.decisao` | Somente o Responsável (N3) vinculado ao líder do RDO pode decidir. |
| Observação da devolução | `rdo_revisoes.observacao` | Obrigatória ao devolver; visível ao emitente na tela do RDO devolvido. |
| Data/hora | `rdo_revisoes.ocorrido_em` | Registrada automaticamente. |

### 13.6 Dados do planejamento e arquivamento

| Campo apresentado | Origem | Regra |
|---|---|---|
| Lançado Avanço | `rdo_planejamentos.lancado_avanco_*` | Apenas Planejamento pode marcar; RDO deve estar `LIBERADO` ou `ARQUIVADO`; registra usuário e data/hora. |
| Lançado DHT | `rdo_planejamentos.lancado_dht_*` | Apenas Planejamento pode marcar; registra usuário e data/hora. |
| Arquivado | `rdo_planejamentos.arquivado_*` e `rdos.status` | Apenas Planejamento pode arquivar RDOs `LIBERADO`. O RDO e seu PDF permanecem disponíveis para consulta. |
| Baixar PDF | `rdo_documentos` e `rdo_historicos` | Não altera status; grava evento de download no histórico. A versão vigente é a de maior `versao`. |

### 13.7 Índices e consultas principais

Além das chaves primárias e estrangeiras, deverão existir índices para as consultas mais frequentes:

| Tabela | Índice recomendado | Finalidade |
|---|---|---|
| `rdos` | `numero` único | Localizar RDO por código oficial. |
| `rdos` | `(status, data_servico DESC)` | Painéis do emitente, N3 e planejamento. |
| `rdos` | `responsavel_lider_id` | Caixa de entrada do Responsável N3. |
| `rdo_servicos` | `tag`, `rec`, `numero_pt` | Buscar por equipamento, REC ou PT. |
| `rdo_itens_executados` | `cml` | Buscar intervenções pelo CML. |
| `rdo_planejamentos` | `arquivado_em`, `lancado_avanco_em`, `lancado_dht_em` | Filtrar pendências de planejamento. |
| `rdo_revisoes` | `(rdo_id, ocorrido_em DESC)` | Decisão vigente e histórico de revisões. |
| `rdo_historicos` | `(rdo_id, ocorrido_em DESC)` | Exibir a linha do tempo do RDO. |

## 14. Diagrama de casos de uso

O diagrama apresenta as ações que cada perfil poderá executar no MVP. Todos os acessos exigem autenticação e o sistema aplica as permissões conforme o perfil do usuário.

```mermaid
flowchart LR
    ADMIN([Administrador])
    EMITENTE([Emitente N2])
    RESP([Responsavel N3])
    PLAN([Planejamento])

    subgraph SISTEMA["Sistema de RDO Digital"]
        direction TB

        subgraph ACESSO["Acesso e conta"]
            UC01(["Aceitar convite e criar senha"])
            UC02([Autenticar-se])
            UC03([Recuperar senha])
            UC04([Encerrar sessao])
        end

        subgraph ADMINISTRACAO["Administracao"]
            UC05(["Enviar convite para Emitente, Responsavel ou Planejamento"])
            UC06(["Gerenciar usuarios e permissoes"])
            UC07(["Gerenciar funcionarios, cargos e niveis"])
            UC08(["Gerenciar areas, fiscais e pacotes"])
            UC09(["Gerenciar vistos cadastrados"])
        end

        subgraph EMISSAO["Emissao de RDO"]
            UC10(["Consultar meus RDOs e rascunhos"])
            UC11(["Criar RDO e escolher tipo"])
            UC12(["Preencher cabecalho e clima"])
            UC13(["Registrar servicos: REC, TAG e PT"])
            UC14(["Relacionar equipe a servicos e PTs"])
            UC15(["Registrar CMLs e etapas executadas"])
            UC16([Selecionar vistos])
            UC17([Salvar rascunho])
            UC18(["Emitir RDO, gerar PDF e enviar ao N3"])
            UC19(["Consultar ou baixar PDF"])
            UC26(["Corrigir RDO devolvido e reemitir"])
        end

        subgraph REVISAO["Revisao N3"]
            UC27(["Consultar RDOs recebidos para revisao"])
            UC28(["Aprovar e liberar para o Planejamento"])
            UC29(["Devolver ao emitente com observacoes"])
        end

        subgraph PLANEJAMENTO["Planejamento"]
            UC20(["Consultar RDOs liberados"])
            UC21(["Pesquisar por RDO, TAG, REC, PT ou CML"])
            UC22([Marcar Lancado Avanco])
            UC23([Marcar Lancado DHT])
            UC24([Arquivar RDO])
            UC25(["Consultar historico e baixar PDF"])
        end
    end

    ADMIN --> UC01
    ADMIN --> UC02
    ADMIN --> UC03
    ADMIN --> UC04
    ADMIN --> UC05
    ADMIN --> UC06
    ADMIN --> UC07
    ADMIN --> UC08
    ADMIN --> UC09
    ADMIN --> UC19

    EMITENTE --> UC01
    EMITENTE --> UC02
    EMITENTE --> UC03
    EMITENTE --> UC04
    EMITENTE --> UC10
    EMITENTE --> UC11
    EMITENTE --> UC12
    EMITENTE --> UC13
    EMITENTE --> UC14
    EMITENTE --> UC15
    EMITENTE --> UC16
    EMITENTE --> UC17
    EMITENTE --> UC18
    EMITENTE --> UC19
    EMITENTE --> UC26

    RESP --> UC01
    RESP --> UC02
    RESP --> UC03
    RESP --> UC04
    RESP --> UC19
    RESP --> UC27
    RESP --> UC28
    RESP --> UC29

    PLAN --> UC01
    PLAN --> UC02
    PLAN --> UC03
    PLAN --> UC04
    PLAN --> UC20
    PLAN --> UC21
    PLAN --> UC22
    PLAN --> UC23
    PLAN --> UC24
    PLAN --> UC25

    UC11 --> UC12
    UC12 --> UC13
    UC13 --> UC14
    UC14 --> UC15
    UC15 --> UC16
    UC16 --> UC17
    UC17 --> UC18
    UC18 --> UC27
    UC27 --> UC28
    UC27 --> UC29
    UC29 --> UC26
    UC26 --> UC27
    UC28 --> UC20
    UC20 --> UC22
    UC20 --> UC23
    UC22 --> UC24
    UC23 --> UC24
```

### 14.1 Resumo por perfil

| Perfil | Casos de uso principais |
|---|---|
| Administrador | Convidar usuários (Emitente, Responsável e Planejamento), gerenciar acessos e manter os cadastros necessários ao RDO. |
| Emitente (N2) | Preencher, salvar, emitir, corrigir devoluções, consultar e baixar seus RDOs. O emitente é vinculado ao funcionário N2 e normalmente é incluído automaticamente na relação de efetivo. |
| Responsável (N3) | Consultar RDOs emitidos para si, aprovar/liberar para o Planejamento ou devolver ao emitente com observações. |
| Planejamento | Consultar RDOs liberados, pesquisar informações operacionais, marcar os lançamentos de Avanço e DHT, arquivar e baixar o PDF. |

### 14.2 Regras de acesso derivadas do diagrama

1. Somente o Administrador poderá enviar convites e manter cadastros administrativos.
2. O Emitente poderá editar somente RDOs próprios que estejam em `RASCUNHO` ou `DEVOLVIDO`.
3. A emissão bloqueia a edição normal, gera o PDF, atribui número (na primeira vez) e envia o documento ao Responsável (N3) indicado no cabeçalho.
4. Somente o Responsável (N3) vinculado ao RDO poderá aprovar ou devolver enquanto o status for `AGUARDANDO_RESPONSAVEL`.
5. Somente Planejamento poderá marcar Avanço, DHT e Arquivado, e somente em RDOs `LIBERADO`.
6. Todo usuário poderá consultar apenas os RDOs compatíveis com o seu perfil e baixar documentos para os quais tenha permissão.
7. O arquivamento é manual; os lançamentos de Avanço e DHT são independentes e não precisam estar ambos marcados para que o Planejamento arquive o RDO.
8. Após `LIBERADO`, o documento é imutável. Exclusões de rascunhos e linhas só ocorrem antes da primeira emissão.

## 15. Mapa de telas e navegação

O mapa abaixo converte os casos de uso em telas. Ele será a referência para evoluir o protótipo visual e, posteriormente, implementar as rotas do React.

```mermaid
flowchart TD
    INICIO([Acesso ao sistema])
    LOGIN[Tela de login]
    CONVITE["Aceitar convite e criar senha"]
    RECUPERAR[Recuperar senha]

    INICIO --> LOGIN
    INICIO --> CONVITE
    LOGIN --> RECUPERAR

    LOGIN -->|Administrador| ADM[Dashboard administrativo]
    LOGIN -->|Emitente N2| HOME[Inicio do emitente]
    LOGIN -->|Responsavel N3| REV[Caixa de entrada do Responsavel]
    LOGIN -->|Planejamento| PLAN[Caixa de entrada do planejamento]

    subgraph ADMIN["Navegacao do Administrador"]
        ADM --> USU[Usuarios e convites]
        ADM --> CAD[Central de cadastros]
        CAD --> FUN[Funcionarios e cargos]
        CAD --> APOIO["Areas, fiscais, pacotes e vistos"]
    end

    subgraph EMIT["Navegacao do Emitente"]
        HOME --> LISTA[Meus RDOs]
        HOME --> TIPO["Novo RDO: escolher tipo"]
        LISTA --> DETALHE[Detalhe do RDO]
        TIPO --> CAB[Cabecalho e clima]
        CAB --> SERV["Servicos: REC, TAG e PT"]
        SERV --> EQUIPE["Equipe e vinculo com servicos/PTs"]
        EQUIPE --> ITENS["Itens executados: CML e etapas"]
        ITENS --> REVISAO[Revisao e emissao]
        REVISAO --> DETALHE
        DETALHE --> PDF["Visualizar ou baixar PDF"]
        DETALHE --> CORRIGIR["Corrigir RDO devolvido"]
        CORRIGIR --> CAB
    end

    subgraph N3NAV["Navegacao do Responsavel N3"]
        REV --> RFILTRO[Pendencias de revisao]
        REV --> RDET[Detalhe do RDO recebido]
        RFILTRO --> RDET
        RDET --> RAPROVA[Aprovar e liberar]
        RDET --> RDEVOLVE["Devolver com observacoes"]
        RDET --> RPDF["Visualizar ou baixar PDF"]
    end

    subgraph PLANEJ["Navegacao do Planejamento"]
        PLAN --> FILTRO[Pesquisa e filtros]
        PLAN --> PD[Detalhe do RDO recebido]
        FILTRO --> PD
        PD --> AV[Marcar Lancado Avanco]
        PD --> DHT[Marcar Lancado DHT]
        PD --> ARQ[Arquivar RDO]
        PD --> PPDF["Visualizar ou baixar PDF"]
    end

    HOME --> PERFIL[Perfil]
    REV --> PERFIL
    PLAN --> PERFIL
    ADM --> PERFIL
```

### 15.1 Telas de acesso

| ID | Tela | Usuário | Objetivo e ações principais |
|---|---|---|---|
| AC01 | Login | Todos | Informar e-mail e senha; acessar o painel conforme o perfil. |
| AC02 | Aceitar convite | Emitente, Responsável e Planejamento | Validar convite, confirmar nome e criar senha. |
| AC03 | Recuperar senha | Todos | Solicitar link seguro para redefinição de senha. |
| AC04 | Perfil | Todos | Consultar dados da conta, sair e acessar ajuda. |

### 15.2 Telas do Emitente

| ID | Tela | Objetivo e ações principais |
|---|---|---|
| EM01 | Início | Exibir rascunhos, RDOs recentes, devolvidos, resumo (RDOs emitidos e rascunhos) e atalho para novo RDO. |
| EM02 | Meus RDOs | Listar, filtrar e buscar RDOs próprios por número, data, tipo e status. |
| EM03 | Escolha do tipo | Selecionar isolamento/pintura e torres/tubulações. |
| EM04 | Cabeçalho e clima | Preencher data, turno, área, fiscal, pacote, N3, horários e clima. |
| EM05 | Serviços e PTs | Adicionar itens de serviço com REC, TAG, PT, horários e observação. |
| EM06 | Relação de efetivo | Selecionar N1/N2, registrar entrada/saída e vincular cada pessoa aos serviços e PTs. |
| EM07 | Itens executados | Adicionar CMLs vinculados ao TAG, marcar etapas do tipo e preencher campos técnicos. |
| EM08 | Revisão e emissão | Validar dados, selecionar vistos, salvar rascunho ou emitir o RDO. |
| EM09 | Detalhe do RDO | Consultar linha do tempo, dados preenchidos, PDF e, se `DEVOLVIDO`, as observações do N3; permitir edição apenas quando rascunho ou devolvido. |

### 15.3 Telas do Responsável (N3)

| ID | Tela | Objetivo e ações principais |
|---|---|---|
| RV01 | Caixa de entrada | Exibir RDOs emitidos aguardando revisão do N3 logado. |
| RV02 | Detalhe para revisão | Ler dados, abrir PDF, aprovar/liberar ou devolver com observações obrigatórias. |
| RV03 | Histórico de revisões | Consultar RDOs já aprovados ou devolvidos por este N3. |

### 15.4 Telas do Planejamento

| ID | Tela | Objetivo e ações principais |
|---|---|---|
| PL01 | Caixa de entrada | Exibir RDOs liberados pelo N3 e pendentes de tratamento. |
| PL02 | Pesquisa e filtros | Pesquisar por número, TAG, REC, PT, CML, área, pacote, tipo e status. |
| PL03 | Detalhe do RDO | Ler dados, abrir PDF, registrar Avanço, DHT e Arquivamento. |
| PL04 | Arquivo | Consultar RDOs arquivados e baixar suas cópias digitais. |

### 15.5 Telas do Administrador

| ID | Tela | Objetivo e ações principais |
|---|---|---|
| AD01 | Dashboard administrativo | Exibir resumo de usuários, RDOs e pendências operacionais. |
| AD02 | Usuários e convites | Criar, reenviar, revogar convites para Emitente, Responsável e Planejamento; ativar/desativar contas. |
| AD03 | Funcionários e cargos | Manter matrícula, nome, função, nível N1/N2/N3 e situação ativa. |
| AD04 | Cadastros de apoio | Manter áreas, fiscais, pacotes e vistos cadastrados. |

### 15.6 Ordem de prototipação recomendada

1. AC01, AC02 e AC03 — acesso seguro por convite (incluindo perfil Responsável).
2. EM01, EM02 e EM03 — navegação principal do emitente e escolha do RDO.
3. EM04 a EM08 — fluxo completo de preenchimento e emissão.
4. RV01 a RV03 — revisão, aprovação e devolução pelo Responsável N3.
5. EM09 e PL01 a PL04 — consulta, lançamento e arquivamento pelo Planejamento.
6. AD01 a AD04 — cadastros e administração.

## 16. Conclusão

O MVP proposto substitui o caminho físico do RDO por um fluxo web centralizado entre o emitente, o Responsável (N3) e o planejamento. A aplicação preserva a estrutura operacional dos modelos existentes, inclui a revisão do N3 antes da liberação, organiza os dados necessários aos lançamentos posteriores e cria uma base escalável para melhorias futuras.

Depois de emitido e liberado, o documento é imutável, garantindo a rastreabilidade. Exclusões só acontecem antes da emissão, em rascunhos e linhas ainda não consolidadas.
