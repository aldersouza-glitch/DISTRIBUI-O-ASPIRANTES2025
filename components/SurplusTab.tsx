import React, { useState, useMemo } from 'react';
import { policeData } from '../data/tableData';
import DataTable from './DataTable';
import DashboardCard from './DashboardCard';
import { ArrowTrendingUpIcon, UsersIcon } from './Icons';

interface SurplusTabProps {
  selectedComando: string;
  setSelectedComando: (comando: string) => void;
  selectedOpm: string;
  setSelectedOpm: (opm: string) => void;
}

type RankFilter = 'all' | 'cap' | 'ten1' | 'ten2';
type QuadroFilter = 'all' | 'qoem' | 'qoe';

const QuadroFilterButtons: React.FC<{
  filter: QuadroFilter;
  setFilter: (filter: QuadroFilter) => void;
}> = ({ filter, setFilter }) => (
  <div className="flex items-center justify-start sm:justify-end space-x-2">
    <span className="text-sm font-medium text-custom-text-secondary mr-2">Filtrar por Quadro:</span>
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

const SurplusTab: React.FC<SurplusTabProps> = ({
  selectedComando,
  setSelectedComando,
  selectedOpm,
  setSelectedOpm,
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'SUPERÁVIT TOTAL',
    direction: 'descending',
  });
  const [rankFilter, setRankFilter] = useState<RankFilter>('all');
  const [quadroFilter, setQuadroFilter] = useState<QuadroFilter>('all');

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
    }
    setSortConfig({ key, direction });
  };

  const handleRankFilterClick = (filter: RankFilter) => {
    setRankFilter(prev => (prev === filter ? 'all' : filter));
  };

  const cardStyle = (filter: RankFilter) => `rounded-lg cursor-pointer transition-all duration-200 ${
    rankFilter === filter ? 'ring-2 ring-custom-accent shadow-lg' : 'ring-0 hover:ring-2 hover:ring-custom-accent/50'
  }`;

  const { filteredHeaders, filteredDataRows, filteredTotalRow, cardData } = useMemo(() => {
    const dataToProcess = policeData.filter(item => {
      const comandoMatch = selectedComando === 'all' || item.grandeComando === selectedComando;
      const opmMatch = selectedOpm === 'all' || item.opm === selectedOpm;
      return comandoMatch && opmMatch;
    });
    
    const surplusData = dataToProcess.map(item => {
        const p = item.previsto;
        const e = item.existente;

        const dCapQoem = p.capQoem - e.capQoem;
        const dCapQoe = p.capQoe - e.capQoe;
        const dTen1Qoem = p.ten1Qoem - e.ten1Qoem;
        const dTen1Qoe = p.ten1Qoe - e.ten1Qoe;
        const dTen2Qoem = p.ten2Qoem - e.ten2Qoem;
        const dTen2Qoe = p.ten2Qoe - e.ten2Qoe;
        
        const sCapQoem = (quadroFilter === 'all' || quadroFilter === 'qoem') && dCapQoem < 0 ? -dCapQoem : 0;
        const sCapQoe = (quadroFilter === 'all' || quadroFilter === 'qoe') && dCapQoe < 0 ? -dCapQoe : 0;
        const sTen1Qoem = (quadroFilter === 'all' || quadroFilter === 'qoem') && dTen1Qoem < 0 ? -dTen1Qoem : 0;
        const sTen1Qoe = (quadroFilter === 'all' || quadroFilter === 'qoe') && dTen1Qoe < 0 ? -dTen1Qoe : 0;
        const sTen2Qoem = (quadroFilter === 'all' || quadroFilter === 'qoem') && dTen2Qoem < 0 ? -dTen2Qoem : 0;
        const sTen2Qoe = (quadroFilter === 'all' || quadroFilter === 'qoe') && dTen2Qoe < 0 ? -dTen2Qoe : 0;
        const total = sCapQoem + sCapQoe + sTen1Qoem + sTen1Qoe + sTen2Qoem + sTen2Qoe;

        return {
            grandeComando: item.grandeComando,
            opm: item.opm,
            sCapQoem, sCapQoe, sTen1Qoem, sTen1Qoe, sTen2Qoem, sTen2Qoe, total,
        };
    }).filter(item => item.total > 0);

    let dataForTable = surplusData;
    if (rankFilter !== 'all') {
      dataForTable = surplusData.filter(item => {
        switch (rankFilter) {
          case 'cap':
            return (item.sCapQoem + item.sCapQoe) > 0;
          case 'ten1':
            return (item.sTen1Qoem + item.sTen1Qoe) > 0;
          case 'ten2':
            return (item.sTen2Qoem + item.sTen2Qoe) > 0;
          default:
            return true;
        }
      });
    }

    const headers = [
      "GRANDE COMANDO", "OPM", "SUPERÁVIT CAP QOEM", "SUPERÁVIT CAP QOE", "SUPERÁVIT 1º TEN QOEM", 
      "SUPERÁVIT 1º TEN QOE", "SUPERÁVIT 2º TEN QOEM", "SUPERÁVIT 2º TEN QOE", "SUPERÁVIT TOTAL"
    ];
  
    let dataRows = dataForTable.map(item => [
      item.grandeComando,
      item.opm,
      item.sCapQoem,
      item.sCapQoe,
      item.sTen1Qoem,
      item.sTen1Qoe,
      item.sTen2Qoem,
      item.sTen2Qoe,
      item.total,
    ]);
  
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

    const totals = dataForTable.reduce((acc, curr) => {
        acc[0] += curr.sCapQoem;
        acc[1] += curr.sCapQoe;
        acc[2] += curr.sTen1Qoem;
        acc[3] += curr.sTen1Qoe;
        acc[4] += curr.sTen2Qoem;
        acc[5] += curr.sTen2Qoe;
        acc[6] += curr.total;
        return acc;
    }, [0, 0, 0, 0, 0, 0, 0]);
  
    const totalRow = ["TOTAL", "", ...totals];
    
    const cardTotals = dataToProcess.reduce((acc, item) => {
        const p = item.previsto;
        const e = item.existente;
        const dCapQoem = p.capQoem - e.capQoem;
        const dCapQoe = p.capQoe - e.capQoe;
        const dTen1Qoem = p.ten1Qoem - e.ten1Qoem;
        const dTen1Qoe = p.ten1Qoe - e.ten1Qoe;
        const dTen2Qoem = p.ten2Qoem - e.ten2Qoem;
        const dTen2Qoe = p.ten2Qoe - e.ten2Qoe;
        
        const sCapQoem = dCapQoem < 0 ? -dCapQoem : 0;
        const sCapQoe = dCapQoe < 0 ? -dCapQoe : 0;
        const sTen1Qoem = dTen1Qoem < 0 ? -dTen1Qoem : 0;
        const sTen1Qoe = dTen1Qoe < 0 ? -dTen1Qoe : 0;
        const sTen2Qoem = dTen2Qoem < 0 ? -dTen2Qoem : 0;
        const sTen2Qoe = dTen2Qoe < 0 ? -dTen2Qoe : 0;

        let currentSurplusCap = 0;
        let currentSurplusTen1 = 0;
        let currentSurplusTen2 = 0;

        if (quadroFilter === 'all' || quadroFilter === 'qoem') {
            currentSurplusCap += sCapQoem;
            currentSurplusTen1 += sTen1Qoem;
            currentSurplusTen2 += sTen2Qoem;
        }
        if (quadroFilter === 'all' || quadroFilter === 'qoe') {
            currentSurplusCap += sCapQoe;
            currentSurplusTen1 += sTen1Qoe;
            currentSurplusTen2 += sTen2Qoe;
        }

        acc.surplusCap += currentSurplusCap;
        acc.surplusTen1 += currentSurplusTen1;
        acc.surplusTen2 += currentSurplusTen2;
        acc.totalSurplus += currentSurplusCap + currentSurplusTen1 + currentSurplusTen2;
        
        return acc;
    }, { totalSurplus: 0, surplusCap: 0, surplusTen1: 0, surplusTen2: 0 });

    if (quadroFilter === 'all') {
      return {
        filteredHeaders: headers,
        filteredDataRows: dataRows,
        filteredTotalRow: totalRow,
        cardData: cardTotals,
      };
    }

    const indicesToKeep = new Set([0, 1]); // GRANDE COMANDO, OPM
    headers.forEach((h, i) => {
      if (i >= 2 && i <= 7) { // Surplus columns
        if (h.toLowerCase().includes(quadroFilter)) {
          indicesToKeep.add(i);
        }
      }
    });
    indicesToKeep.add(8); // SUPERÁVIT TOTAL

    const filterLogic = (_: any, i: number) => indicesToKeep.has(i);

    return {
      filteredHeaders: headers.filter(filterLogic),
      filteredDataRows: dataRows.map(row => row.filter(filterLogic)),
      filteredTotalRow: totalRow.filter(filterLogic),
      cardData: cardTotals,
    };

  }, [selectedComando, selectedOpm, sortConfig, rankFilter, quadroFilter]);


  return (
    <div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => handleRankFilterClick('all')} className={cardStyle('all')}>
            <DashboardCard title="Total Superávit de Postos" value={cardData.totalSurplus} icon={<ArrowTrendingUpIcon />} />
        </div>
        <div onClick={() => handleRankFilterClick('cap')} className={cardStyle('cap')}>
            <DashboardCard title="Superávit Total CAP" value={cardData.surplusCap} icon={<UsersIcon />} />
        </div>
        <div onClick={() => handleRankFilterClick('ten1')} className={cardStyle('ten1')}>
            <DashboardCard title="Superávit Total 1º TEN" value={cardData.surplusTen1} icon={<UsersIcon />} />
        </div>
        <div onClick={() => handleRankFilterClick('ten2')} className={cardStyle('ten2')}>
            <DashboardCard title="Superávit Total 2º TEN" value={cardData.surplusTen2} icon={<UsersIcon />} />
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">Tabela de Superávit por Posto</h2>
            <QuadroFilterButtons filter={quadroFilter} setFilter={setQuadroFilter} />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center bg-gray-800/50 p-3 rounded-lg">
            <span className="text-sm font-medium text-custom-text-secondary">Filtrar por Local:</span>
            <div className="flex-1">
                <label htmlFor="surplus-comando-select" className="sr-only">Grande Comando</label>
                <select
                    id="surplus-comando-select"
                    value={selectedComando}
                    onChange={handleComandoChange}
                    className="w-full bg-custom-card border border-custom-border text-custom-text-primary text-sm rounded-lg focus:ring-custom-accent focus:border-custom-accent p-2.5"
                >
                    {comandos.map(c => <option key={c} value={c}>{c === 'all' ? 'Todos os Grandes Comandos' : c}</option>)}
                </select>
            </div>
            <div className="flex-1">
                 <label htmlFor="surplus-opm-select" className="sr-only">OPM</label>
                 <select
                    id="surplus-opm-select"
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

export default SurplusTab;