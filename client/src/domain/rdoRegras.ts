import type { Rdo, UsuarioAtual } from "./rdo";

export const PENDENCIA_SERVICO = "Cadastre pelo menos 1 servico.";
export const PENDENCIA_EQUIPE = "Cadastre pelo menos 1 pessoa na equipe.";
export const PENDENCIA_VISTO = "Registre pelo menos 1 visto.";

export function pendenciasEmissao(rdo: Pick<Rdo, "servicos" | "equipe" | "vistos">): string[] {
  const pendencias: string[] = [];
  if (rdo.servicos.length < 1) pendencias.push(PENDENCIA_SERVICO);
  if (rdo.equipe.length < 1) pendencias.push(PENDENCIA_EQUIPE);
  if (rdo.vistos.length < 1) pendencias.push(PENDENCIA_VISTO);
  return pendencias;
}

export function podeEmitir(rdo: Pick<Rdo, "servicos" | "equipe" | "vistos" | "status">): boolean {
  if (rdo.status !== "RASCUNHO" && rdo.status !== "DEVOLVIDO") return false;
  return pendenciasEmissao(rdo).length === 0;
}

export function tipoImutavel(rdo: Pick<Rdo, "numero" | "status">): boolean {
  return rdo.status !== "RASCUNHO" || rdo.numero !== null;
}

export function rdoVisivelNaCaixaN3(
  rdo: Pick<Rdo, "status" | "responsavelLiderId">,
  usuario: Pick<UsuarioAtual, "perfil" | "funcionarioId">
): boolean {
  if (usuario.perfil !== "RESPONSAVEL") return false;
  if (!usuario.funcionarioId) return false;
  if (rdo.status !== "AGUARDANDO_RESPONSAVEL") return false;
  return rdo.responsavelLiderId === usuario.funcionarioId;
}

export function filtrarCaixaN3<T extends Pick<Rdo, "status" | "responsavelLiderId">>(
  rdos: T[],
  usuario: Pick<UsuarioAtual, "perfil" | "funcionarioId">
): T[] {
  return rdos.filter((rdo) => rdoVisivelNaCaixaN3(rdo, usuario));
}

export function podeRevisar(
  rdo: Pick<Rdo, "status" | "responsavelLiderId">,
  usuario: Pick<UsuarioAtual, "perfil" | "funcionarioId">
): boolean {
  return rdoVisivelNaCaixaN3(rdo, usuario);
}

export function rdoSomenteLeitura(rdo: Pick<Rdo, "status">): boolean {
  return rdo.status === "ARQUIVADO";
}

export function podeDesarquivar(rdo: Pick<Rdo, "status">): boolean {
  return rdo.status !== "ARQUIVADO";
}

export const ACAO_DESARQUIVAR = "desarquivar";
