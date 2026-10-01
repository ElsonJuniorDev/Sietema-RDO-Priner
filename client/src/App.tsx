import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { CaixaResponsavelPage } from "./pages/CaixaResponsavelPage";
import { DetalheRdoPage } from "./pages/DetalheRdoPage";
import type { Rdo, UsuarioAtual } from "./domain/rdo";

interface AppProps {
  usuario: UsuarioAtual;
  rdos: Rdo[];
}

export function App({ usuario, rdos }: AppProps) {
  return (
    <Routes>
      <Route
        path="/responsavel"
        element={<CaixaResponsavelPage usuario={usuario} rdos={rdos} />}
      />
      <Route
        path="/rdos/:id/*"
        element={<RotaDetalhe usuario={usuario} rdos={rdos} />}
      />
      <Route path="*" element={<Navigate to="/responsavel" replace />} />
    </Routes>
  );
}

function RotaDetalhe({ usuario, rdos }: { usuario: UsuarioAtual; rdos: Rdo[] }) {
  const { id } = useParams();
  const rdo = rdos.find((item) => item.id === id);
  if (!rdo) return <p>RDO nao encontrado.</p>;
  return <DetalheRdoPage rdo={rdo} usuario={usuario} />;
}
