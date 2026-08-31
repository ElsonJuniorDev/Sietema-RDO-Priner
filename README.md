# Sistema de RDO - Priner

MVP do Sistema de Registro Diário de Obra Digital para a disciplina de Acesso por Cordas.

## Autenticação por convite

O primeiro módulo funcional inclui:

- Login com sessão protegida por cookie `HttpOnly`.
- Convite individual, de uso único e com expiração de 48 horas.
- Convites para Emitente vinculados somente a funcionários N2.
- Recuperação e redefinição de senha.
- Perfis de Administrador, Emitente e Planejamento.
- Registro de eventos de segurança e ações de convite.

- ## Estrutura

- `client/`: interface React com Vite.
- `server/`: API Express e banco SQLite local.
- `server/data/rdo.db`: banco criado automaticamente ao iniciar a API. Não deve ser versionado nem usado como armazenamento de produção.
