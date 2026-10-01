import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CaixaResponsavel } from "./CaixaResponsavel";
import type { Rdo, UsuarioAtual } from "../domain/rdo";

function rdo(id: string, lider: string, status: Rdo["status"] = "AGUARDANDO_RESPONSAVEL"): Rdo {
  return {
    id,
    numero: `RDO-${id}`,
    tipo: "ISOLAMENTO_TORRES",
    status,
    responsavelLiderId: lider,
    emitidoPorUsuarioId: "emitente",
    servicos: [{ id: "s1", numeroItem: 1 }],
    equipe: [{ id: "e1", funcionarioId: "n2", obrigatorio: true }],
    vistos: [{ id: "v1", tipoVisto: "ENCARREGADO" }],
  };
}

const n3A: UsuarioAtual = {
  id: "user-a",
  perfil: "RESPONSAVEL",
  funcionarioId: "func-n3-a",
};

describe("CaixaResponsavel", () => {
  it("nao lista nem abre RDO de outro N3", async () => {
    const onAbrir = vi.fn();
    render(
      <CaixaResponsavel
        usuario={n3A}
        rdos={[
          rdo("meu", "func-n3-a"),
          rdo("alheio", "func-n3-b"),
          rdo("liberado", "func-n3-a", "LIBERADO"),
        ]}
        onAbrir={onAbrir}
      />
    );
    expect(screen.getByTestId("abrir-rdo-meu")).toBeInTheDocument();
    expect(screen.queryByTestId("abrir-rdo-alheio")).toBeNull();
    expect(screen.queryByTestId("abrir-rdo-liberado")).toBeNull();
    await userEvent.click(screen.getByTestId("abrir-rdo-meu"));
    expect(onAbrir).toHaveBeenCalledWith("meu");
  });
});
