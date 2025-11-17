
export interface OPMData {
  grandeComando: string;
  opm: string;
  previsto: {
    capQoem: number;
    capQoe: number;
    ten1Qoem: number;
    ten1Qoe: number;
    ten2Qoem: number;
    ten2Qoe: number;
  };
  existente: {
    capQoem: number;
    capQoe: number;
    ten1Qoem: number;
    ten1Qoe: number;
    ten2Qoem: number;
    ten2Qoe: number;
    total: number;
    st: number;
    concorremEscala: number;
    aspirantes: number;
  };
}

export type Tab = 'overview' | 'existing' | 'deficit' | 'ranking' | 'surplus';