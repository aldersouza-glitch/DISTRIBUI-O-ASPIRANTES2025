import React, { useState, useMemo } from 'react';
import { policeData } from '../data/tableData';
import DataTable from './DataTable';
import DashboardCard from './DashboardCard';
import { ArrowTrendingDownIcon, UsersIcon } from './Icons';

interface DeficitTabProps {
  selectedComando: string;
  setSelectedComando: (comando: string) => void;
  selectedOpm: string;
  setSelectedOpm: (opm: string) => void;
}

const FilterButtons: React.FC<{
  filter: 'all' | 'qoem' | 'qoe';
  setFilter: (filter: 'all' | 'qoem' | 'qoe') => void;
}> = ({ filter, setFilter }) => (
  <div className="flex items-center justify-start sm:justify-end space-x-2">
    <span className="text-sm font-medium text-custom-text-secondary mr-2">Filtrar por Posto:</span>
    <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
      {(['all', 'qoem', 'qoe'] as const).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${
            filter === f
              ? 'bg-custom-accent text-white shadow'
              : 'bg-transparent hover:bg-gray-700/50 text-custom-text-secondary'
          }`}
        >
          {f === 'all' ? 'Todos' : f.toUpperCase()}
        </button>
      ))}
    </div>
  </div>
);

const DeficitTab: React.FC<DeficitTabProps> = ({
  selectedComando,
  setSelectedComando,
  selectedOpm,
  setSelectedOpm,
}) => {
  const [filter, setFilter] = useState<'all' | 'qoem' | 'qoe'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'DEFICIT TOTAL',
    direction: 'descending',
  });

  const comandos = useMemo(() => ['all', ...Array.from(new Set(policeData.map(d => d.grandeComando)))], []);
  
  const opms = useMemo(() => {
    let availableOpms: string[];
    if (selectedComando === 'all') {
      availableOpms = [...new Set(policeData.map(d => d.opm))].sort();
    } else {
      availableOpms = policeData
        .filter(d => d.grandeComando === selectedComando)
        .map(d => d.opm)
        .sort();
    }
    return ['all', ...availableOpms];
  }, [selectedComando]);


  const handleComandoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedComando(e.target.value);
    setSelectedOpm('all'); 
  };

  const handleOpmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOpm(e.target.value);
  };
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };

  const { filteredHeaders, filteredDataRows, filteredTotalRow, cardData } = useMemo(() => {
    const dataToProcess = policeData.filter(item => {
      const comandoMatch = selectedComando === 'all' || item.grandeComando === selectedComando;
      const opmMatch = selectedOpm === 'all' || item.opm === selectedOpm;
      return comandoMatch && opmMatch;
    });

    const cardTotals = dataToProcess.reduce((acc, item) => {
        const p = item.previsto;
        const e = item.existente;
        const dCapQoem = p.capQoem - e.capQoem;
        const dCapQoe = p.capQoe - e.capQoe;
        const dTen1Qoem = p.ten1Qoem - e.ten1Qoem;
        const dTen1Qoe = p.ten1Qoe - e.ten1Qoe;
        const dTen2Qoem = p.ten2Qoem - e.ten2Qoem;
        const dTen2Qoe = p.ten2Qoe - e.ten2Qoe;
        const deficitQoem = dCapQoem + dTen1Qoem + dTen2Qoem;
        const deficitQoe = dCapQoe + dTen1Qoe + dTen2Qoe;

        if (filter === 'all') {
            acc.totalDeficit += deficitQoem + deficitQoe;
            acc.deficitCap += dCapQoem + dCapQoe;
            acc.deficitTen1 += dTen1Qoem + dTen1Qoe;
            acc.deficitTen2 += dTen2Qoem + dTen2Qoe;
        } else if (filter === 'qoem') {
            acc.totalDeficit += deficitQoem;
            acc.deficitCap += dCapQoem;
            acc.deficitTen1 += dTen1Qoem;
            acc.deficitTen2 += dTen2Qoem;
        } else if (filter === 'qoe') {
            acc.totalDeficit += deficitQoe;
            acc.deficitCap += dCapQoe;
            acc.deficitTen1 += dTen1Qoe;
            acc.deficitTen2 += dTen2Qoe;
        }
        return acc;
    }, { totalDeficit: 0, deficitCap: 0, deficitTen1: 0, deficitTen2: 0 });

    const headers = [
      "GRANDE COMANDO", "OPM", "DEFICIT CAP QOEM", "DEFICIT CAP QOE", "DEFICIT 1º TEN QOEM", 
      "DEFICIT 1º TEN QOE", "DEFICIT 2º TEN QOEM", "DEFICIT 2º TEN QOE", "DEFICIT TOTAL"
    ];
  
    let dataRows = dataToProcess.map(item => {
      const p = item.previsto;
      const e = item.existente;
      const dCapQoem = p.capQoem - e.capQoem;
      const dCapQoe = p.capQoe - e.capQoe;
      const dTen1Qoem = p.ten1Qoem - e.ten1Qoem;
      const dTen1Qoe = p.ten1Qoe - e.ten1Qoe;
      const dTen2Qoem = p.ten2Qoem - e.ten2Qoem;
      const dTen2Qoe = p.ten2Qoe - e.ten2Qoe;

      const deficitQoem = dCapQoem + dTen1Qoem + dTen2Qoem;
      const deficitQoe = dCapQoe + dTen1Qoe + dTen2Qoe;

      let rowTotal = deficitQoem + deficitQoe;
      if (filter === 'qoem') {
        rowTotal = deficitQoem;
      } else if (filter === 'qoe') {
        rowTotal = deficitQoe;
      }
      
      return [
        item.grandeComando,
        item.opm,
        dCapQoem,
        dCapQoe,
        dTen1Qoem,
        dTen1Qoe,
        dTen2Qoem,
        dTen2Qoe,
        rowTotal,
      ];
    });
  
    if (sortConfig.key) {
        const sortKeyIndex = headers.indexOf(sortConfig.key);
        if (sortKeyIndex !== -1) {
            dataRows.sort((a, b) => {
                const valA = a[sortKeyIndex];
                const valB = b[sortKeyIndex];
                
                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;
                
                if (typeof valA === 'number' && typeof valB === 'number') {
                    if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortConfig.direction === 'ascending'
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                }
                return 0;
            });
        }
    }

    const totals = dataRows.reduce((acc: number[], row) => {
        // row[2] to row[8] are the numerical values
        for (let i = 2; i < row.length; i++) {
            // FIX: Using a const variable to help TypeScript with type narrowing.
            const cellValue = row[i];
            if (typeof cellValue === 'number') {
                acc[i - 2] += cellValue;
            }
        }
        return acc;
    }, [0, 0, 0, 0, 0, 0, 0]);
  
    const totalRow = ["TOTAL", "", ...totals];

    if (filter === 'all') {
      return { 
        filteredHeaders: headers, 
        filteredDataRows: dataRows, 
        filteredTotalRow: totalRow,
        cardData: cardTotals
      };
    }

    const indicesToKeep = new Set([0, 1]); // GRANDE COMANDO, OPM
    headers.forEach((h, i) => {
      if (i >= 2 && i <= 7) { // QOEM/QOE columns
        if (h.toLowerCase().includes(filter)) {
          indicesToKeep.add(i);
        }
      }
    });
    indicesToKeep.add(8); // DEFICIT TOTAL
    
    const filterLogic = (_: any, i: number) => indicesToKeep.has(i);

    return {
      filteredHeaders: headers.filter(filterLogic),
      filteredDataRows: dataRows.map(row => row.filter(filterLogic)),
      filteredTotalRow: totalRow.filter(filterLogic),
      cardData: cardTotals,
    };
  }, [filter, selectedComando, selectedOpm, sortConfig]);


  return (
    <div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Déficit de Postos" value={cardData.totalDeficit} icon={<ArrowTrendingDownIcon />} />
        <DashboardCard title="Déficit Total CAP" value={cardData.deficitCap} icon={<UsersIcon />} />
        <DashboardCard title="Déficit Total 1º TEN" value={cardData.deficitTen1} icon={<UsersIcon />} />
        <DashboardCard title="Déficit Total 2º TEN" value={cardData.deficitTen2} icon={<UsersIcon />} />
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">Tabela de Déficit por Posto</h2>
            <FilterButtons filter={filter} setFilter={setFilter} />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-gray-800/50 p-3 rounded-lg">
            <span className="text-sm font-medium text-custom-text-secondary">Filtrar por Local:</span>
            <div className="flex-1">
                <label htmlFor="deficit-comando-select" className="sr-only">Grande Comando</label>
                <select
                    id="deficit-comando-select"
                    value={selectedComando}
                    onChange={handleComandoChange}
                    className="w-full bg-custom-card border border-custom-border text-custom-text-primary text-sm rounded-lg focus:ring-custom-accent focus:border-custom-accent p-2.5"
                >
                    {comandos.map(c => <option key={c} value={c}>{c === 'all' ? 'Todos os Grandes Comandos' : c}</option>)}
                </select>
            </div>
            <div className="flex-1">
                 <label htmlFor="deficit-opm-select" className="sr-only">OPM</label>
                 <select
                    id="deficit-opm-select"
                    value={selectedOpm}
                    onChange={handleOpmChange}
                    className="w-full bg-custom-card border border-custom-border text-custom-text-primary text-sm rounded-lg focus:ring-custom-accent focus:border-custom-accent p-2.5"
                 >
                     {opms.map(o => <option key={o} value={o}>{o === 'all' ? 'Todas as OPMs' : o}</option>)}
                 </select>
            </div>
        </div>
      </div>
      <DataTable 
        headers={filteredHeaders} 
        dataRows={filteredDataRows} 
        totalRow={filteredTotalRow}
        sortConfig={sortConfig}
        onSort={requestSort}
      />
    </div>
  );
};

export default DeficitTab;