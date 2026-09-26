# Sistema de RDO - Priner

MVP do Sistema de Registro Diário de Obra Digital para a disciplina de Acesso por Cordas.

## Fluxo

Admin cadastra + convida → Emitente ativa conta → preenche RDO → rascunho ou emite (número definitivo + PDF) → Responsável N3 aprova ou devolve → se liberado, vai ao Planejamento → Planejamento lança Avanço/DHT → arquiva.

## Autenticação por convite

- Login com sessão protegida por cookie `HttpOnly`.
- Convite individual, de uso único e com expiração de 48 horas.
- Convites para Emitente vinculados somente a funcionários N2.
- Convites para Responsável vinculados somente a funcionários N3.
- Recuperação e redefinição de senha.
- Perfis de Administrador, Emitente, Responsável (N3) e Planejamento.
- Registro de eventos de segurança e ações de convite.

## Perfis

- **Administrador:** cadastros base e convites.
- **Emitente (N2):** cria, rascunha, emite e corrige RDOs devolvidos.
- **Responsável (N3):** revisa, libera para o Planejamento ou devolve com observações.
- **Planejamento:** lança Avanço/DHT e arquiva RDOs liberados.

## Estrutura

- `client/`: interface React com Vite.
- `server/`: API Express e banco SQLite local.
- `server/data/rdo.db`: banco criado automaticamente ao iniciar a API. Não deve ser versionado nem usado como armazenamento de produção.

A especificação completa está em `ANALISE_DE_REQUISITOS.md`.
