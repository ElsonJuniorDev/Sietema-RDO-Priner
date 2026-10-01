import { HttpError } from "./httpErrors.js";

export const ERRO_MINIMO_SERVICO = "Falta pelo menos 1 servico.";
export const ERRO_MINIMO_EQUIPE = "Falta pelo menos 1 pessoa na equipe.";
export const ERRO_MINIMO_VISTO = "Falta pelo menos 1 visto.";
export const ERRO_TIPO_IMUTAVEL = "Tipo do RDO nao pode ser alterado apos a primeira emissao.";
export const ERRO_REVISAO_NAO_AUTORIZADA =
  "Somente o responsavel lider do cabecalho pode revisar este RDO.";
export const ERRO_ARQUIVADO = "RDO arquivado nao pode ser alterado.";
export const ERRO_DESARQUIVAR = ERRO_ARQUIVADO;

export function validarEmissao(rdo) {
  const erros = [];
  if (!Array.isArray(rdo.servicos) || rdo.servicos.length < 1) erros.push(ERRO_MINIMO_SERVICO);
  if (!Array.isArray(rdo.equipe) || rdo.equipe.length < 1) erros.push(ERRO_MINIMO_EQUIPE);
  if (!Array.isArray(rdo.vistos) || rdo.vistos.length < 1) erros.push(ERRO_MINIMO_VISTO);
  if (rdo.status !== "RASCUNHO" && rdo.status !== "DEVOLVIDO") {
    erros.push("Somente RDO em RASCUNHO ou DEVOLVIDO pode ser emitido.");
  }
  return erros;
}

export function validarAlteracaoTipo(rdo, tipoNovo) {
  if (tipoNovo === undefined) return null;
  const jaEmitido = rdo.status !== "RASCUNHO" || rdo.numero != null;
  if (jaEmitido && tipoNovo !== rdo.tipo) return ERRO_TIPO_IMUTAVEL;
  return null;
}

export function validarRevisao(rdo, usuario) {
  if (usuario.perfil !== "RESPONSAVEL") return ERRO_REVISAO_NAO_AUTORIZADA;
  if (!usuario.funcionarioId) return ERRO_REVISAO_NAO_AUTORIZADA;
  if (rdo.status !== "AGUARDANDO_RESPONSAVEL") return ERRO_REVISAO_NAO_AUTORIZADA;
  if (rdo.responsavelLiderId !== usuario.funcionarioId) return ERRO_REVISAO_NAO_AUTORIZADA;
  return null;
}

export function validarRdoArquivado(rdo) {
  if (rdo.status === "ARQUIVADO") return ERRO_ARQUIVADO;
  return null;
}

export function validarDesarquivar(rdo) {
  return validarRdoArquivado(rdo);
}

export function assertEmissao(rdo) {
  const erros = validarEmissao(rdo);
  if (erros.length > 0) {
    throw new HttpError(422, "EMISSAO_INVALIDA", "Nao e possivel emitir o RDO.", erros);
  }
}

export function assertAlteracaoTipo(rdo, tipoNovo) {
  const erro = validarAlteracaoTipo(rdo, tipoNovo);
  if (erro) {
    throw new HttpError(409, "TIPO_IMUTAVEL", erro);
  }
}

export function assertRevisao(rdo, usuario) {
  const erro = validarRevisao(rdo, usuario);
  if (erro) {
    throw new HttpError(403, "REVISAO_NAO_AUTORIZADA", erro);
  }
}

export function assertNaoArquivado(rdo) {
  const erro = validarRdoArquivado(rdo);
  if (erro) {
    throw new HttpError(409, "ARQUIVAMENTO_DEFINITIVO", erro);
  }
}

export function assertDesarquivar(rdo) {
  assertNaoArquivado(rdo);
}
