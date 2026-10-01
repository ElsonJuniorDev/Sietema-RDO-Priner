import { Router } from "express";
import { HttpError } from "./httpErrors.js";
import {
  assertAlteracaoTipo,
  assertEmissao,
  assertNaoArquivado,
  assertRevisao,
} from "./rdoValidacoes.js";

function exigirRdo(store, id) {
  const rdo = store.get(id);
  if (!rdo) throw new HttpError(404, "RDO_NAO_ENCONTRADO", "RDO nao encontrado.");
  return rdo;
}

export function createRdoRouter(store) {
  const router = Router();

  router.post("/:id/emitir", (req, res, next) => {
    try {
      const rdo = exigirRdo(store, req.params.id);
      assertNaoArquivado(rdo);
      assertEmissao(rdo);
      const agora = new Date();
      if (!rdo.numero) {
        rdo.numero = store.proximoNumero(agora.getFullYear());
        rdo.emitidoEm = agora.toISOString();
      }
      rdo.status = "AGUARDANDO_RESPONSAVEL";
      rdo.atualizadoEm = agora.toISOString();
      res.json(store.save(rdo));
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id", (req, res, next) => {
    try {
      const rdo = exigirRdo(store, req.params.id);
      assertNaoArquivado(rdo);
      if (Object.prototype.hasOwnProperty.call(req.body ?? {}, "tipo")) {
        assertAlteracaoTipo(rdo, req.body.tipo);
        rdo.tipo = req.body.tipo;
      }
      if (Object.prototype.hasOwnProperty.call(req.body ?? {}, "observacaoPriner")) {
        rdo.observacaoPriner = req.body.observacaoPriner;
      }
      rdo.atualizadoEm = new Date().toISOString();
      res.json(store.save(rdo));
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/revisar", (req, res, next) => {
    try {
      const rdo = exigirRdo(store, req.params.id);
      assertNaoArquivado(rdo);
      assertRevisao(rdo, req.usuario);
      const decisao = req.body?.decisao;
      if (decisao !== "APROVADO" && decisao !== "DEVOLVIDO") {
        throw new HttpError(422, "DECISAO_INVALIDA", "Informe decisao APROVADO ou DEVOLVIDO.");
      }
      if (decisao === "DEVOLVIDO") {
        const observacao = (req.body?.observacao ?? "").trim();
        if (!observacao) {
          throw new HttpError(422, "OBSERVACAO_OBRIGATORIA", "Observacao e obrigatoria na devolucao.");
        }
        rdo.status = "DEVOLVIDO";
        rdo.ultimaDevolucao = observacao;
      } else {
        rdo.status = "LIBERADO";
        rdo.liberadoEm = new Date().toISOString();
        rdo.liberadoPorUsuarioId = req.usuario.id;
      }
      rdo.atualizadoEm = new Date().toISOString();
      res.json(store.save(rdo));
    } catch (err) {
      next(err);
    }
  });

  router.patch("/:id/planejamento", (req, res, next) => {
    try {
      const rdo = exigirRdo(store, req.params.id);
      assertNaoArquivado(rdo);
      rdo.planejamento = { ...(rdo.planejamento ?? {}), ...(req.body ?? {}) };
      rdo.atualizadoEm = new Date().toISOString();
      res.json(store.save(rdo));
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/arquivar", (req, res, next) => {
    try {
      const rdo = exigirRdo(store, req.params.id);
      assertNaoArquivado(rdo);
      if (rdo.status !== "LIBERADO") {
        throw new HttpError(422, "ARQUIVAR_INVALIDO", "Somente RDO LIBERADO pode ser arquivado.");
      }
      rdo.status = "ARQUIVADO";
      rdo.atualizadoEm = new Date().toISOString();
      res.json(store.save(rdo));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
