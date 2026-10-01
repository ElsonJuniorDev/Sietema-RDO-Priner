import { CaixaResponsavel } from "../components/CaixaResponsavel";
import type { Rdo, UsuarioAtual } from "../domain/rdo";

interface CaixaResponsavelPageProps {
  usuario: UsuarioAtual;
  rdos: Rdo[];
  onAbrir?: (rdoId: string) => void;
}

export function CaixaResponsavelPage({ usuario, rdos, onAbrir }: CaixaResponsavelPageProps) {
  return <CaixaResponsavel usuario={usuario} rdos={rdos} onAbrir={onAbrir} />;
}
