import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, before } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const triggersSql = readFileSync(join(root, "schema/003_triggers_invariantes.sql"), "utf8");

const ddl = `
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
CREATE TABLE rdos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20),
  tipo tipo_rdo NOT NULL,
  status status_rdo NOT NULL DEFAULT 'RASCUNHO',
  observacao_priner TEXT
);
`;

describe("triggers PostgreSQL em rdos (sem API)", () => {
  let db;

  before(async () => {
    db = new PGlite();
    await db.exec(ddl);
    await db.exec(triggersSql);
  });

  it("UPDATE de tipo em RDO emitido falha", async () => {
    await db.exec(`
      INSERT INTO rdos (id, numero, tipo, status)
      VALUES (
        '11111111-1111-1111-1111-111111111111',
        'RDO-2026-000001',
        'ISOLAMENTO_TORRES',
        'AGUARDANDO_RESPONSAVEL'
      );
    `);

    await assert.rejects(
      () =>
        db.exec(`
          UPDATE rdos
          SET tipo = 'PINTURA_TORRES'
          WHERE id = '11111111-1111-1111-1111-111111111111';
        `),
      (err) =>
        String(err.message).includes("Tipo do RDO nao pode ser alterado apos a primeira emissao.")
    );

    const { rows } = await db.query(
      `SELECT tipo FROM rdos WHERE id = '11111111-1111-1111-1111-111111111111'`
    );
    assert.equal(rows[0].tipo, "ISOLAMENTO_TORRES");
  });

  it("UPDATE de qualquer campo em RDO arquivado falha", async () => {
    await db.exec(`
      INSERT INTO rdos (id, numero, tipo, status, observacao_priner)
      VALUES (
        '22222222-2222-2222-2222-222222222222',
        'RDO-2026-000002',
        'PINTURA_TORRES',
        'ARQUIVADO',
        'original'
      );
    `);

    await assert.rejects(
      () =>
        db.exec(`
          UPDATE rdos
          SET observacao_priner = 'alterado'
          WHERE id = '22222222-2222-2222-2222-222222222222';
        `),
      (err) => String(err.message).includes("RDO arquivado nao pode ser alterado.")
    );

    await assert.rejects(
      () =>
        db.exec(`
          UPDATE rdos
          SET status = 'LIBERADO'
          WHERE id = '22222222-2222-2222-2222-222222222222';
        `),
      (err) => String(err.message).includes("RDO arquivado nao pode ser alterado.")
    );

    const { rows } = await db.query(
      `SELECT status, observacao_priner FROM rdos WHERE id = '22222222-2222-2222-2222-222222222222'`
    );
    assert.equal(rows[0].status, "ARQUIVADO");
    assert.equal(rows[0].observacao_priner, "original");
  });

  it("UPDATE de tipo em rascunho sem numero continua permitido", async () => {
    await db.exec(`
      INSERT INTO rdos (id, numero, tipo, status)
      VALUES (
        '33333333-3333-3333-3333-333333333333',
        NULL,
        'ISOLAMENTO_TORRES',
        'RASCUNHO'
      );
    `);
    await db.exec(`
      UPDATE rdos
      SET tipo = 'PINTURA_TUBULACOES'
      WHERE id = '33333333-3333-3333-3333-333333333333';
    `);
    const { rows } = await db.query(
      `SELECT tipo FROM rdos WHERE id = '33333333-3333-3333-3333-333333333333'`
    );
    assert.equal(rows[0].tipo, "PINTURA_TUBULACOES");
  });
});
