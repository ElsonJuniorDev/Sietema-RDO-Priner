import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampoTipoRdo } from "./CampoTipoRdo";

describe("CampoTipoRdo", () => {
  it("permanece editavel no rascunho sem numero", () => {
    render(
      <CampoTipoRdo rdo={{ status: "RASCUNHO", numero: null, tipo: "ISOLAMENTO_TORRES" }} />
    );
    expect(screen.getByTestId("campo-tipo")).toBeEnabled();
  });

  it("fica somente leitura apos ter numero", () => {
    render(
      <CampoTipoRdo
        rdo={{
          status: "AGUARDANDO_RESPONSAVEL",
          numero: "RDO-2026-000001",
          tipo: "PINTURA_TORRES",
        }}
      />
    );
    const campo = screen.getByTestId("campo-tipo");
    expect(campo).toBeDisabled();
    expect(campo).toHaveAttribute("aria-readonly", "true");
  });
});
