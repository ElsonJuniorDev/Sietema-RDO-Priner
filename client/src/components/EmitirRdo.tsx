import { podeEmitir, pendenciasEmissao } from "../domain/rdoRegras";
import type { Rdo } from "../domain/rdo";

interface EmitirRdoProps {
  rdo: Pick<Rdo, "servicos" | "equipe" | "vistos" | "status">;
  onEmitir?: () => void;
}

export function EmitirRdo({ rdo, onEmitir }: EmitirRdoProps) {
  const pendencias = pendenciasEmissao(rdo);
  const habilitado = podeEmitir(rdo);
  const motivo = pendencias.join(" ");

  return (
    <section>
      {!habilitado && pendencias.length > 0 ? (
        <div data-testid="pendencias-emissao" role="status">
          <p>Nao e possivel emitir. Falta:</p>
          <ul>
            {pendencias.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <button
        type="button"
        data-testid="botao-emitir"
        disabled={!habilitado}
        title={!habilitado ? motivo : "Emitir RDO"}
        onClick={() => {
          if (!habilitado) return;
          onEmitir?.();
        }}
      >
        Emitir
      </button>
    </section>
  );
}
