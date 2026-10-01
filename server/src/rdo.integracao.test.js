import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createApp } from "./app.js";
import { createRdoStore } from "./rdoStore.js";
import {
  ERRO_ARQUIVADO,
  ERRO_MINIMO_EQUIPE,
  ERRO_MINIMO_SERVICO,
  ERRO_MINIMO_VISTO,
  ERRO_REVISAO_NAO_AUTORIZADA,
  ERRO_TIPO_IMUTAVEL,
} from "./rdoValidacoes.js";

function rdoBase(parcial = {}) {
  return {
    id: "rdo-1",
    numero: null,
    tipo: "ISOLAMENTO_TORRES",
    status: "RASCUNHO",
    responsavelLiderId: "func-n3-a",
    emitidoPorUsuarioId: "user-emitente",
    servicos: [{ id: "s1" }],
    equipe: [{ id: "e1" }],
    vistos: [{ id: "v1" }],
    ...parcial,
  };
}

const emitente = { id: "user-emitente", perfil: "EMITENTE", funcionarioId: "func-n2" };
const n3A = { id: "user-n3-a", perfil: "RESPONSAVEL", funcionarioId: "func-n3-a" };
const n3B = { id: "user-n3-b", perfil: "RESPONSAVEL", funcionarioId: "func-n3-b" };
const planejador = { id: "user-plan", perfil: "PLANEJAMENTO", funcionarioId: null };

function headers(usuario) {
  const h = {
    "content-type": "application/json",
    "x-usuario-id": usuario.id,
    "x-usuario-perfil": usuario.perfil,
  };
  if (usuario.funcionarioId) h["x-usuario-funcionario-id"] = usuario.funcionarioId;
  return h;
}

async function listen(app) {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

async function request(baseUrl, method, path, usuario, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: headers(usuario),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { status: res.status, body: json };
}

const servidores = [];

async function appCom(rdo) {
  const store = createRdoStore([rdo]);
  const app = createApp(store);
  const srv = await listen(app);
  servidores.push(srv);
  return { store, ...srv };
}

after(async () => {
  await Promise.all(servidores.map((s) => s.close()));
});

describe("POST /api/rdos/:id/emitir — minimos", () => {
  it("retorna 422 com a lista do que falta", async () => {
    const { url } = await appCom(rdoBase({ servicos: [], equipe: [], vistos: [] }));
    const res = await request(url, "POST", "/api/rdos/rdo-1/emitir", emitente);
    assert.equal(res.status, 422);
    assert.equal(res.body.codigo, "EMISSAO_INVALIDA");
    assert.deepEqual(res.body.faltando, [
      ERRO_MINIMO_SERVICO,
      ERRO_MINIMO_EQUIPE,
      ERRO_MINIMO_VISTO,
    ]);
  });

  it("nao altera o status quando falha", async () => {
    const { url, store } = await appCom(rdoBase({ servicos: [] }));
    await request(url, "POST", "/api/rdos/rdo-1/emitir", emitente);
    assert.equal(store.get("rdo-1").status, "RASCUNHO");
    assert.equal(store.get("rdo-1").numero, null);
  });
});

describe("PATCH /api/rdos/:id — tipo imutavel", () => {
  it("retorna 409 se tentar trocar tipo apos emissao", async () => {
    const { url } = await appCom(
      rdoBase({ status: "AGUARDANDO_RESPONSAVEL", numero: "RDO-2026-000001" })
    );
    const res = await request(url, "PATCH", "/api/rdos/rdo-1", emitente, {
      tipo: "PINTURA_TORRES",
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.codigo, "TIPO_IMUTAVEL");
    assert.equal(res.body.erro, ERRO_TIPO_IMUTAVEL);
  });

  it("permite trocar tipo ainda em rascunho", async () => {
    const { url } = await appCom(rdoBase());
    const res = await request(url, "PATCH", "/api/rdos/rdo-1", emitente, {
      tipo: "PINTURA_TORRES",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.tipo, "PINTURA_TORRES");
  });
});

describe("POST /api/rdos/:id/revisar — so o N3 do cabecalho", () => {
  it("retorna 403 para outro RESPONSAVEL", async () => {
    const { url } = await appCom(
      rdoBase({
        status: "AGUARDANDO_RESPONSAVEL",
        numero: "RDO-2026-000001",
        responsavelLiderId: "func-n3-a",
      })
    );
    const res = await request(url, "POST", "/api/rdos/rdo-1/revisar", n3B, {
      decisao: "APROVADO",
    });
    assert.equal(res.status, 403);
    assert.equal(res.body.codigo, "REVISAO_NAO_AUTORIZADA");
    assert.equal(res.body.erro, ERRO_REVISAO_NAO_AUTORIZADA);
  });

  it("aceita o N3 do cabecalho", async () => {
    const { url } = await appCom(
      rdoBase({
        status: "AGUARDANDO_RESPONSAVEL",
        numero: "RDO-2026-000001",
        responsavelLiderId: "func-n3-a",
      })
    );
    const res = await request(url, "POST", "/api/rdos/rdo-1/revisar", n3A, {
      decisao: "APROVADO",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "LIBERADO");
  });
});

describe("qualquer alteracao em ARQUIVADO — 409", () => {
  const arquivado = rdoBase({
    status: "ARQUIVADO",
    numero: "RDO-2026-000001",
  });

  it("PATCH campos retorna 409", async () => {
    const { url } = await appCom(arquivado);
    const res = await request(url, "PATCH", "/api/rdos/rdo-1", emitente, {
      observacaoPriner: "x",
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.codigo, "ARQUIVAMENTO_DEFINITIVO");
    assert.equal(res.body.erro, ERRO_ARQUIVADO);
  });

  it("PATCH planejamento retorna 409", async () => {
    const { url } = await appCom(arquivado);
    const res = await request(url, "PATCH", "/api/rdos/rdo-1/planejamento", planejador, {
      lancadoAvanco: true,
    });
    assert.equal(res.status, 409);
    assert.equal(res.body.codigo, "ARQUIVAMENTO_DEFINITIVO");
  });

  it("POST revisar retorna 409", async () => {
    const { url } = await appCom(arquivado);
    const res = await request(url, "POST", "/api/rdos/rdo-1/revisar", n3A, {
      decisao: "APROVADO",
    });
    assert.equal(res.status, 409);
  });

  it("POST emitir retorna 409", async () => {
    const { url } = await appCom(arquivado);
    const res = await request(url, "POST", "/api/rdos/rdo-1/emitir", emitente);
    assert.equal(res.status, 409);
  });
});
