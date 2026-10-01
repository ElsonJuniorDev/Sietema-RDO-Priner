import { HttpError } from "./httpErrors.js";

export function autenticar(req, _res, next) {
  const id = req.header("x-usuario-id");
  const perfil = req.header("x-usuario-perfil");
  if (!id || !perfil) {
    next(new HttpError(401, "NAO_AUTENTICADO", "Usuario nao autenticado."));
    return;
  }
  req.usuario = {
    id,
    perfil,
    funcionarioId: req.header("x-usuario-funcionario-id") || null,
  };
  next();
}
