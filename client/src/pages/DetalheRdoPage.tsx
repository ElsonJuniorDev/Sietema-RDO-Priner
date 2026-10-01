import { DetalheRdo } from "../components/DetalheRdo";
import type { Rdo, UsuarioAtual } from "../domain/rdo";
import { podeRevisar } from "../domain/rdoRegras";

interface DetalheRdoPageProps {
  rdo: Rdo;
  usuario: UsuarioAtual;
}

export function DetalheRdoPage({ rdo, usuario }: DetalheRdoPageProps) {
  if (
    usuario.perfil === "RESPONSAVEL" &&
    rdo.status === "AGUARDANDO_RESPONSAVEL" &&
    !podeRevisar(rdo, usuario)
  ) {
    return <p data-testid="rdo-indisponivel">RDO nao disponivel para revisao.</p>;
  }

  return <DetalheRdo rdo={rdo} usuario={usuario} />;
}
