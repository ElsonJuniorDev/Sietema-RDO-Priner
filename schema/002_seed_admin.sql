-- Primeiro Administrador (seed interno, sem convite).
-- funcionario_id permanece nulo.
-- Substitua o valor de senha_hash por um bcrypt gerado fora deste arquivo.

INSERT INTO usuarios (
  nome,
  email,
  senha_hash,
  perfil,
  ativo
) VALUES (
  'Administrador',
  'admin@local',
  'SUBSTITUIR_POR_BCRYPT',
  'ADMINISTRADOR',
  TRUE
)
ON CONFLICT (email) DO NOTHING;
