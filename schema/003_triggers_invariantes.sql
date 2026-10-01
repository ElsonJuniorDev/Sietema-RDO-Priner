CREATE OR REPLACE FUNCTION fn_rdos_tipo_imutavel()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (OLD.numero IS NOT NULL OR OLD.status <> 'RASCUNHO')
     AND NEW.tipo IS DISTINCT FROM OLD.tipo THEN
    RAISE EXCEPTION 'Tipo do RDO nao pode ser alterado apos a primeira emissao.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rdos_tipo_imutavel ON rdos;
CREATE TRIGGER trg_rdos_tipo_imutavel
BEFORE UPDATE OF tipo ON rdos
FOR EACH ROW
EXECUTE PROCEDURE fn_rdos_tipo_imutavel();

CREATE OR REPLACE FUNCTION fn_rdos_arquivado_definitivo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'ARQUIVADO' THEN
    RAISE EXCEPTION 'RDO arquivado nao pode ser alterado.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rdos_arquivado_definitivo ON rdos;
CREATE TRIGGER trg_rdos_arquivado_definitivo
BEFORE UPDATE ON rdos
FOR EACH ROW
EXECUTE PROCEDURE fn_rdos_arquivado_definitivo();
