import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import type { Rdo, UsuarioAtual } from "./domain/rdo";
import "./styles.css";

const usuario: UsuarioAtual = {
  id: "demo-n3",
  perfil: "RESPONSAVEL",
  funcionarioId: "func-n3-a",
};

const rdos: Rdo[] = [];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App usuario={usuario} rdos={rdos} />
    </BrowserRouter>
  </StrictMode>
);
