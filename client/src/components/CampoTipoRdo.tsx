import { RDO_TIPOS, type Rdo, type RdoTipo } from "../domain/rdo";
import { tipoImutavel } from "../domain/rdoRegras";

const ROTULOS: Record<RdoTipo, string> = {
  ISOLAMENTO_TORRES: "Isolamento de torres",
  ISOLAMENTO_TUBULACOES: "Isolamento de tubulacoes",
  PINTURA_TORRES: "Pintura de torres",
  PINTURA_TUBULACOES: "Pintura de tubulacoes",
};

interface CampoTipoRdoProps {
  rdo: Pick<Rdo, "numero" | "status" | "tipo">;
  onChange?: (tipo: RdoTipo) => void;
}

export function CampoTipoRdo({ rdo, onChange }: CampoTipoRdoProps) {
  const somenteLeitura = tipoImutavel(rdo);

  return (
    <label>
      Tipo
      <select
        data-testid="campo-tipo"
        value={rdo.tipo}
        disabled={somenteLeitura}
        aria-readonly={somenteLeitura}
        onChange={(event) => {
          if (somenteLeitura) return;
          onChange?.(event.target.value as RdoTipo);
        }}
      >
        {RDO_TIPOS.map((tipo) => (
          <option key={tipo} value={tipo}>
            {ROTULOS[tipo]}
          </option>
        ))}
      </select>
    </label>
  );
}
