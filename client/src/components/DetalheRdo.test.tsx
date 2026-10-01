import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DetalheRdo } from "./DetalheRdo";
import { DetalheRdoPage } from "../pages/DetalheRdoPage";
import type { Rdo, UsuarioAtual } from "../domain/rdo";

const planejador: UsuarioAtual = {
  id: "plan",
  perfil: "PLANEJAMENTO",
  funcionarioId: null,
};

const n3: UsuarioAtual = {
  id: "n3",
  perfil: "RESPONSAVEL",
  funcionarioId: "func-n3-a",
};

function rdo(status: Rdo["status"], lider = "func-n3-a"): Rdo {
  return {
    id: "rdo-1",
    numero: "RDO-2026-000001",
    tipo: "ISOLAMENTO_TORRES",
    status,
    responsavelLiderId: lider,
    emitidoPorUsuarioId: "emitente",
    servicos: [{ id: "s1", numeroItem: 1 }],
    equipe: [{ id: "e1", funcionarioId: "n2", obrigatorio: true }],
    vistos: [{ id: "v1", tipoVisto: "ENCARREGADO" }],
  };
}

describe("DetalheRdo arquivamento", () => {
  it("exibe somente leitura e nao mostra desarquivar nem revisar", () => {
    render(<DetalheRdo rdo={rdo("ARQUIVADO")} usuario={planejador} />);
    expect(screen.getByTestId("detalhe-rdo")).toHaveAttribute("data-readonly", "true");
    expect(screen.getByTestId("aviso-arquivado")).toBeInTheDocument();
    expect(screen.queryByTestId("botao-desarquivar")).toBeNull();
    expect(screen.queryByTestId("botao-arquivar")).toBeNull();
    expect(screen.queryByTestId("acoes-revisao")).toBeNull();
    expect(screen.getByTestId("campo-tipo")).toBeDisabled();
  });

  it("nao mostra acoes de revisao para N3 que nao e o lider", () => {
    render(<DetalheRdo rdo={rdo("AGUARDANDO_RESPONSAVEL", "func-n3-b")} usuario={n3} />);
    expect(screen.queryByTestId("acoes-revisao")).toBeNull();
  });

  it("nao abre RDO de outro N3 na pagina de detalhe", () => {
    render(
      <DetalheRdoPage rdo={rdo("AGUARDANDO_RESPONSAVEL", "func-n3-b")} usuario={n3} />
    );
    expect(screen.getByTestId("rdo-indisponivel")).toBeInTheDocument();
    expect(screen.queryByTestId("acoes-revisao")).toBeNull();
    expect(screen.queryByTestId("detalhe-rdo")).toBeNull();
  });
});

describe("rota de desarquivar", () => {
  it("nao existe rota que reverte ARQUIVADO", () => {
    render(
      <MemoryRouter initialEntries={["/rdos/rdo-1/desarquivar"]}>
        <Routes>
          <Route path="/rdos/:id/*" element={<DetalheRdoPage rdo={rdo("ARQUIVADO")} usuario={planejador} />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByTestId("botao-desarquivar")).toBeNull();
    expect(screen.getByTestId("aviso-arquivado")).toBeInTheDocument();
  });
});
