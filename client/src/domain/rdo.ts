export const RDO_TIPOS = [
  "ISOLAMENTO_TORRES",
  "ISOLAMENTO_TUBULACOES",
  "PINTURA_TORRES",
  "PINTURA_TUBULACOES",
] as const;

export type RdoTipo = (typeof RDO_TIPOS)[number];

export const RDO_STATUS = [
  "RASCUNHO",
  "AGUARDANDO_RESPONSAVEL",
  "DEVOLVIDO",
  "LIBERADO",
  "ARQUIVADO",
] as const;

export type RdoStatus = (typeof RDO_STATUS)[number];

export const VISTO_TIPOS = ["ENCARREGADO", "SUPERVISOR", "CLIENTE"] as const;

export type VistoTipo = (typeof VISTO_TIPOS)[number];

export interface RdoServico {
  id: string;
  numeroItem: number;
}

export interface RdoEquipe {
  id: string;
  funcionarioId: string;
  obrigatorio: boolean;
}

export interface RdoVisto {
  id: string;
  tipoVisto: VistoTipo;
}

export interface UsuarioAtual {
  id: string;
  perfil: "ADMINISTRADOR" | "EMITENTE" | "RESPONSAVEL" | "PLANEJAMENTO";
  funcionarioId: string | null;
}

export interface Rdo {
  id: string;
  numero: string | null;
  tipo: RdoTipo;
  status: RdoStatus;
  responsavelLiderId: string;
  emitidoPorUsuarioId: string;
  servicos: RdoServico[];
  equipe: RdoEquipe[];
  vistos: RdoVisto[];
}
