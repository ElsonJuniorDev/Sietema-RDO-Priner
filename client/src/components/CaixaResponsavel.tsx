import type { Rdo, UsuarioAtual } from "../domain/rdo";
import { filtrarCaixaN3, podeRevisar } from "../domain/rdoRegras";

interface CaixaResponsavelProps {
  usuario: UsuarioAtual;
  rdos: Rdo[];
  onAbrir?: (rdoId: string) => void;
}

export function CaixaResponsavel({ usuario, rdos, onAbrir }: CaixaResponsavelProps) {
  const visiveis = filtrarCaixaN3(rdos, usuario);

  return (
    <section>
      <h1>Caixa de entrada do Responsavel</h1>
      {visiveis.length === 0 ? (
        <p data-testid="caixa-n3-vazia">Nenhum RDO aguardando sua revisao.</p>
      ) : (
        <ul data-testid="lista-caixa-n3">
          {visiveis.map((rdo) => (
            <li key={rdo.id}>
              <button
                type="button"
                data-testid={`abrir-rdo-${rdo.id}`}
                disabled={!podeRevisar(rdo, usuario)}
                onClick={() => {
                  if (!podeRevisar(rdo, usuario)) return;
                  onAbrir?.(rdo.id);
                }}
              >
                {rdo.numero ?? rdo.id}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
