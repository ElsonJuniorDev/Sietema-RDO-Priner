import { describe, expect, it } from "vitest";
import type { Rdo, UsuarioAtual } from "./rdo";
import {
  filtrarCaixaN3,
  podeDesarquivar,
  podeEmitir,
  podeRevisar,
  pendenciasEmissao,
  PENDENCIA_EQUIPE,
  PENDENCIA_SERVICO,
  PENDENCIA_VISTO,
  rdoSomenteLeitura,
  tipoImutavel,
} from "./rdoRegras";

function rdo(parcial: Partial<Rdo> = {}): Rdo {
  return {
    id: "rdo-1",
    numero: null,
    tipo: "ISOLAMENTO_TORRES",
    status: "RASCUNHO",
    responsavelLiderId: "func-n3-a",
    emitidoPorUsuarioId: "user-emitente",
    servicos: [{ id: "s1", numeroItem: 1 }],
    equipe: [{ id: "e1", funcionarioId: "func-n2", obrigatorio: true }],
    vistos: [{ id: "v1", tipoVisto: "ENCARREGADO" }],
    ...parcial,
  };
}

const n3A: UsuarioAtual = {
  id: "user-n3-a",
  perfil: "RESPONSAVEL",
  funcionarioId: "func-n3-a",
};

const n3B: UsuarioAtual = {
  id: "user-n3-b",
  perfil: "RESPONSAVEL",
  funcionarioId: "func-n3-b",
};

describe("minimos para emitir", () => {
  it("lista servico, equipe e visto quando faltam", () => {
    const pendencias = pendenciasEmissao({ servicos: [], equipe: [], vistos: [] });
    expect(pendencias).toEqual([PENDENCIA_SERVICO, PENDENCIA_EQUIPE, PENDENCIA_VISTO]);
    expect(podeEmitir(rdo({ servicos: [], equipe: [], vistos: [] }))).toBe(false);
  });

  it("habilita emitir com 1 servico, 1 pessoa e 1 visto em rascunho", () => {
    expect(pendenciasEmissao(rdo())).toEqual([]);
    expect(podeEmitir(rdo())).toBe(true);
  });
});

describe("tipo imutavel apos emissao", () => {
  it("permanece editavel no rascunho sem numero", () => {
    expect(tipoImutavel(rdo({ status: "RASCUNHO", numero: null }))).toBe(false);
  });

  it("fica somente leitura quando ha numero ou status diferente de rascunho", () => {
    expect(tipoImutavel(rdo({ status: "RASCUNHO", numero: "RDO-2026-000001" }))).toBe(true);
    expect(tipoImutavel(rdo({ status: "DEVOLVIDO", numero: "RDO-2026-000001" }))).toBe(true);
    expect(
      tipoImutavel(rdo({ status: "AGUARDANDO_RESPONSAVEL", numero: "RDO-2026-000001" }))
    ).toBe(true);
  });
});

describe("revisao restrita ao N3 do cabecalho", () => {
  const pendente = rdo({
    status: "AGUARDANDO_RESPONSAVEL",
    numero: "RDO-2026-000001",
    responsavelLiderId: "func-n3-a",
  });

  it("mostra apenas RDOs do N3 logado", () => {
    const deOutro = rdo({
      id: "rdo-2",
      status: "AGUARDANDO_RESPONSAVEL",
      numero: "RDO-2026-000002",
      responsavelLiderId: "func-n3-b",
    });
    expect(filtrarCaixaN3([pendente, deOutro], n3A).map((item) => item.id)).toEqual(["rdo-1"]);
    expect(podeRevisar(pendente, n3A)).toBe(true);
    expect(podeRevisar(pendente, n3B)).toBe(false);
  });
});

describe("arquivamento definitivo", () => {
  it("arquivado e somente leitura e nao pode desarquivar", () => {
    const arquivado = rdo({ status: "ARQUIVADO", numero: "RDO-2026-000001" });
    expect(rdoSomenteLeitura(arquivado)).toBe(true);
    expect(podeDesarquivar(arquivado)).toBe(false);
  });
});
