import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmitirRdo } from "./EmitirRdo";
import type { Rdo } from "../domain/rdo";

const completo: Pick<Rdo, "servicos" | "equipe" | "vistos" | "status"> = {
  status: "RASCUNHO",
  servicos: [{ id: "s1", numeroItem: 1 }],
  equipe: [{ id: "e1", funcionarioId: "f1", obrigatorio: true }],
  vistos: [{ id: "v1", tipoVisto: "ENCARREGADO" }],
};

describe("EmitirRdo", () => {
  it("desabilita emitir e lista o que falta", () => {
    render(
      <EmitirRdo
        rdo={{ status: "RASCUNHO", servicos: [], equipe: [], vistos: [] }}
      />
    );
    const botao = screen.getByTestId("botao-emitir");
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute(
      "title",
      expect.stringContaining("pelo menos 1 servico")
    );
    const lista = screen.getByTestId("pendencias-emissao");
    expect(lista).toHaveTextContent("pelo menos 1 servico");
    expect(lista).toHaveTextContent("pelo menos 1 pessoa na equipe");
    expect(lista).toHaveTextContent("pelo menos 1 visto");
  });

  it("nao dispara onEmitir quando incompleto", async () => {
    const onEmitir = vi.fn();
    render(
      <EmitirRdo
        rdo={{ status: "RASCUNHO", servicos: [], equipe: [], vistos: [] }}
        onEmitir={onEmitir}
      />
    );
    await userEvent.click(screen.getByTestId("botao-emitir"));
    expect(onEmitir).not.toHaveBeenCalled();
  });

  it("habilita emitir quando os minimos existem", async () => {
    const onEmitir = vi.fn();
    render(<EmitirRdo rdo={completo} onEmitir={onEmitir} />);
    const botao = screen.getByTestId("botao-emitir");
    expect(botao).toBeEnabled();
    expect(screen.queryByTestId("pendencias-emissao")).toBeNull();
    await userEvent.click(botao);
    expect(onEmitir).toHaveBeenCalledTimes(1);
  });
});
