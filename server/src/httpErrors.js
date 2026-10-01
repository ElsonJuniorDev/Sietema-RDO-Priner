export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details ?? null;
  }
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    const body = { erro: err.message, codigo: err.code };
    if (err.details) body.faltando = err.details;
    res.status(err.status).json(body);
    return;
  }
  res.status(500).json({ erro: "Erro interno.", codigo: "INTERNO" });
}
