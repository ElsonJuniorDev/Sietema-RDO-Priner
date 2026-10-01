import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "./httpErrors.js";
import {
  ERRO_ARQUIVADO,
  ERRO_MINIMO_EQUIPE,
  ERRO_MINIMO_SERVICO,
  ERRO_MINIMO_VISTO,
  ERRO_REVISAO_NAO_AUTORIZADA,
  ERRO_TIPO_IMUTAVEL,
  assertDesarquivar,
  assertEmissao,
  assertNaoArquivado,
  assertRevisao,
  validarAlteracaoTipo,
  validarDesarquivar,
  validarEmissao,
  validarRevisao,
} from "./rdoValidacoes.js";

const rdoOk = {
  status: "RASCUNHO",
  numero: null,
  tipo: "ISOLAMENTO_TORRES",
  servicos: [{ id: "s1" }],
  equipe: [{ id: "e1" }],
  vistos: [{ id: "v1" }],
  responsavelLiderId: "func-n3-a",
};

describe("validarEmissao", () => {
  it("lista o que falta", () => {
    const erros = validarEmissao({
      status: "RASCUNHO",
      servicos: [],
      equipe: [],
      vistos: [],
    });
    assert.deepEqual(erros, [ERRO_MINIMO_SERVICO, ERRO_MINIMO_EQUIPE, ERRO_MINIMO_VISTO]);
    assert.throws(
      () => assertEmissao({ status: "RASCUNHO", servicos: [], equipe: [], vistos: [] }),
      (err) => err instanceof HttpError && err.status === 422
    );
  });

  it("aceita rascunho com os tres minimos", () => {
    assert.deepEqual(validarEmissao(rdoOk), []);
  });
});

describe("validarAlteracaoTipo", () => {
  it("bloqueia troca apos emissao", () => {
    const rdo = { ...rdoOk, status: "DEVOLVIDO", numero: "RDO-2026-000001" };
    assert.equal(validarAlteracaoTipo(rdo, "PINTURA_TORRES"), ERRO_TIPO_IMUTAVEL);
  });

  it("permite no rascunho sem numero", () => {
    assert.equal(validarAlteracaoTipo(rdoOk, "PINTURA_TORRES"), null);
  });
});

describe("validarRevisao", () => {
  const pendente = {
    ...rdoOk,
    status: "AGUARDANDO_RESPONSAVEL",
    numero: "RDO-2026-000001",
  };

  it("rejeita outro N3 com 403", () => {
    assert.equal(
      validarRevisao(pendente, { perfil: "RESPONSAVEL", funcionarioId: "func-n3-b" }),
      ERRO_REVISAO_NAO_AUTORIZADA
    );
    assert.throws(
      () => assertRevisao(pendente, { perfil: "RESPONSAVEL", funcionarioId: "func-n3-b" }),
      (err) => err instanceof HttpError && err.status === 403
    );
  });

  it("aceita o N3 do cabecalho", () => {
    assert.equal(
      validarRevisao(pendente, { perfil: "RESPONSAVEL", funcionarioId: "func-n3-a" }),
      null
    );
  });
});

describe("validarRdoArquivado", () => {
  it("rejeita qualquer alteracao", () => {
    const rdo = { ...rdoOk, status: "ARQUIVADO" };
    assert.equal(validarDesarquivar(rdo), ERRO_ARQUIVADO);
    assert.throws(
      () => assertNaoArquivado(rdo),
      (err) => err instanceof HttpError && err.status === 409
    );
    assert.throws(() => assertDesarquivar(rdo));
  });
});
