function clone(valor) {
  return structuredClone(valor);
}

export function createRdoStore(semente = []) {
  const rdos = new Map(semente.map((rdo) => [rdo.id, clone(rdo)]));
  let sequenciaAno = new Map();

  function get(id) {
    const rdo = rdos.get(id);
    return rdo ? clone(rdo) : null;
  }

  function save(rdo) {
    rdos.set(rdo.id, clone(rdo));
    return clone(rdo);
  }

  function proximoNumero(ano) {
    const atual = sequenciaAno.get(ano) ?? 0;
    const proximo = atual + 1;
    sequenciaAno.set(ano, proximo);
    return `RDO-${ano}-${String(proximo).padStart(6, "0")}`;
  }

  return { get, save, proximoNumero };
}
