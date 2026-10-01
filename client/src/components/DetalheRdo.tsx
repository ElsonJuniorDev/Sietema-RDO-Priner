import type { Rdo, UsuarioAtual } from "../domain/rdo";
import { podeRevisar, rdoSomenteLeitura } from "../domain/rdoRegras";
import { CampoTipoRdo } from "./CampoTipoRdo";
import { EmitirRdo } from "./EmitirRdo";

interface DetalheRdoProps {
  rdo: Rdo;
  usuario: UsuarioAtual;
  onEmitir?: () => void;
  onAprovar?: () => void;
  onDevolver?: () => void;
  onArquivar?: () => void;
}

export function DetalheRdo({
  rdo,
  usuario,
  onEmitir,
  onAprovar,
  onDevolver,
  onArquivar,
}: DetalheRdoProps) {
  const somenteLeitura = rdoSomenteLeitura(rdo);
  const mostrarRevisao = podeRevisar(rdo, usuario);
  const mostrarArquivar = usuario.perfil === "PLANEJAMENTO" && rdo.status === "LIBERADO";

  return (
    <article data-testid="detalhe-rdo" data-readonly={somenteLeitura ? "true" : "false"}>
      <h1>{rdo.numero ?? "Rascunho"}</h1>
      <p data-testid="status-rdo">{rdo.status}</p>
      <CampoTipoRdo rdo={rdo} />

      {somenteLeitura ? (
        <p data-testid="aviso-arquivado">RDO arquivado. Somente leitura. Arquivamento definitivo.</p>
      ) : null}

      {usuario.perfil === "EMITENTE" && (rdo.status === "RASCUNHO" || rdo.status === "DEVOLVIDO") ? (
        <EmitirRdo rdo={rdo} onEmitir={onEmitir} />
      ) : null}

      {mostrarRevisao ? (
        <div data-testid="acoes-revisao">
          <button type="button" data-testid="botao-aprovar" onClick={onAprovar}>
            Aprovar e liberar
          </button>
          <button type="button" data-testid="botao-devolver" onClick={onDevolver}>
            Devolver
          </button>
        </div>
      ) : null}

      {mostrarArquivar ? (
        <button type="button" data-testid="botao-arquivar" onClick={onArquivar}>
          Arquivar
        </button>
      ) : null}
    </article>
  );
}
