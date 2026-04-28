import React, { useState, useMemo, useEffect } from 'react';
import { generateSyntheticData, loadRealData, processScores, Neighborhood, Establishment, getScoreColor } from '../utils/data';
import MapView from './Map';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { AlertTriangle, MapPin, Users, Store, Info, Search, Filter, Download } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<{ neighborhoods: Neighborhood[], establishments: Establishment[] } | null>(null);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [useRealData, setUseRealData] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (useRealData) {
      loadRealData().then(processedData => {
        setData(processedData);
        setLoading(false);
      });
    } else {
      const timer = setTimeout(() => {
        const rawData = generateSyntheticData();
        const processedData = processScores(rawData.neighborhoods, rawData.establishments);
        setData(processedData);
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [useRealData]);

  const allNeighborhoodNames = useMemo(() => {
    if (!data) return [];
    return data.neighborhoods.map(n => n.name).sort();
  }, [data]);

  const filteredNeighborhoodNames = useMemo(() => {
    if (!neighborhoodSearch.trim()) return allNeighborhoodNames;
    return allNeighborhoodNames.filter(name => 
      name.toLowerCase().includes(neighborhoodSearch.toLowerCase())
    );
  }, [allNeighborhoodNames, neighborhoodSearch]);

  const toggleNeighborhood = (name: string) => {
    setSelectedNeighborhoods(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const allTypes = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.establishments.map(e => e.type))).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return { neighborhoods: [], establishments: [] };
    
    let filteredNeighborhoods = data.neighborhoods;
    if (selectedNeighborhoods.length > 0) {
      filteredNeighborhoods = data.neighborhoods.filter(n => selectedNeighborhoods.includes(n.name));
    }

    let filteredEstablishments = data.establishments;
    if (selectedTypes.length > 0) {
      filteredEstablishments = data.establishments.filter(e => selectedTypes.includes(e.type));
    }

    return { neighborhoods: filteredNeighborhoods, establishments: filteredEstablishments };
  }, [data, selectedNeighborhoods, selectedTypes]);

  const metrics = useMemo(() => {
    if (!filteredData.neighborhoods.length) return { total: 0, critical: 0, estCount: 0, popRisk: 0 };
    
    const critical = filteredData.neighborhoods.filter(n => (n.score || 0) < 4.0);
    
    return {
      total: filteredData.neighborhoods.length,
      critical: critical.length,
      estCount: filteredData.establishments.length,
      popRisk: critical.reduce((acc, n) => acc + n.population, 0)
    };
  }, [filteredData]);

  const top10Critical = useMemo(() => {
    if (!filteredData.neighborhoods.length) return [];
    return [...filteredData.neighborhoods]
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 10);
  }, [filteredData]);

  const exportToCSV = () => {
    const csvContent = [
      ['Bairro', 'Score', 'Estabelecimentos', 'Renda Media (R$)', 'Populacao', 'Situacao'],
      ...filteredData.neighborhoods.map(n => [
        `"${n.name}"`,
        n.score?.toFixed(2),
        n.establishmentsCount,
        n.income.toFixed(2),
        n.population,
        (n.score || 0) < 4.0 ? 'Crítico' : 'Adequado'
      ])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'desertos_alimentares_rj.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-700">Carregando dados socioeconômicos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2 mb-2">
            <span className="text-3xl">🍎</span> Desertos Alimentares RJ
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Mapeamento do acesso a alimentos saudáveis em comunidades vulneráveis do Rio de Janeiro.
          </p>
        </div>

        <div className="mb-6 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={useRealData}
                onChange={() => setUseRealData(!useRealData)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${useRealData ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useRealData ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-medium text-slate-700">
              Usar Dados Reais (IBGE + OSM)
            </div>
          </label>
        </div>

        {!useRealData && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Modo Demo Ativo:</strong> Exibindo dados sintéticos gerados aleatoriamente para fins de demonstração.
            </div>
          </div>
        )}

        <div className="space-y-6 flex-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filtros
            </h3>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Bairros</label>
                {selectedNeighborhoods.length > 0 && (
                  <button 
                    onClick={() => setSelectedNeighborhoods([])}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Limpar ({selectedNeighborhoods.length})
                  </button>
                )}
              </div>
              
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar bairro..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white"
                  value={neighborhoodSearch}
                  onChange={(e) => setNeighborhoodSearch(e.target.value)}
                />
              </div>

              <div className="h-48 overflow-y-auto border border-slate-200 rounded-md bg-white p-1 shadow-inner custom-scrollbar">
                {filteredNeighborhoodNames.length === 0 ? (
                  <div className="p-3 text-center text-sm text-slate-500">Nenhum bairro encontrado</div>
                ) : (
                  filteredNeighborhoodNames.map(name => {
                    const isSelected = selectedNeighborhoods.includes(name);
                    return (
                      <div 
                        key={name} 
                        onClick={() => toggleNeighborhood(name)}
                        className={`flex items-center px-2.5 py-1.5 rounded cursor-pointer transition-colors mb-0.5 ${isSelected ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2.5 transition-colors shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-sm select-none truncate">{name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipos de Estabelecimento</label>
              <div className="space-y-2">
                {allTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                      checked={selectedTypes.length === 0 || selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes(prev => prev.length === 0 ? [type] : [...prev, type]);
                        } else {
                          setSelectedTypes(prev => {
                            if (prev.length === 0) {
                              return allTypes.filter(t => t !== type);
                            }
                            return prev.filter(t => t !== type);
                          });
                        }
                      }}
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500">
          <p className="mb-2"><strong>Fontes de Dados:</strong></p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Limites de Bairros e Dados Socioeconômicos: IBGE (Censo 2022)</li>
            <li>Estabelecimentos Alimentares: OpenStreetMap via Overpass API</li>
          </ul>
          <p className="mt-4 italic">Projeto desenvolvido para fins de impacto social.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-6 h-6 text-slate-400" /> Visão Geral
          </h2>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar Dados
          </button>
        </header>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Bairros Analisados</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Situação Crítica</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.critical}</p>
              <p className="text-xs text-slate-400 mt-1">Score &lt; 4.0</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Estabelecimentos</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.estCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">População em Risco</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.popRisk.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Mapa de Acesso Alimentar</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Info className="w-4 h-4" />
              <span>Cores mais quentes (vermelho) indicam maior risco.</span>
            </div>
          </div>
          <MapView neighborhoods={filteredData.neighborhoods} establishments={filteredData.establishments} />
        </section>

        {/* Charts and Tables */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Top 10 Bairros com Menor Acesso</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10Critical}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 10]} stroke="#64748b" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#64748b" tick={{fontSize: 12}} />
                  <RechartsTooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    formatter={(value: number) => [value.toFixed(2), 'Score']}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {top10Critical.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.score || 0)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tabela de Scores por Bairro</h3>
            <div className="overflow-x-auto flex-1 border border-slate-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Bairro</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Estab.</th>
                    <th className="px-4 py-3">Renda Média</th>
                    <th className="px-4 py-3">População</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredData.neighborhoods]
                    .sort((a, b) => (a.score || 0) - (b.score || 0))
                    .map((n, i) => (
                    <tr key={n.id} className={`border-b border-slate-100 hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-4 py-3 font-medium text-slate-900">{n.name}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: getScoreColor(n.score || 0) }}>
                        {n.score?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{n.establishmentsCount}</td>
                      <td className="px-4 py-3 text-slate-600">R$ {n.income.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-600">{n.population.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Scatter Plot Section */}
        <section className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            Relação: Renda Média x Score de Acesso
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="income" 
                  name="Renda Média" 
                  unit=" R$" 
                  stroke="#64748b" 
                  tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} 
                />
                <YAxis 
                  type="number" 
                  dataKey="score" 
                  name="Score" 
                  domain={[0, 10]} 
                  stroke="#64748b" 
                />
                <ZAxis type="number" dataKey="population" range={[50, 400]} name="População" />
                <RechartsTooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Renda Média') return [`R$ ${Number(value).toFixed(2)}`, name];
                    return [value, name];
                  }}
                />
                <Scatter name="Bairros" data={filteredData.neighborhoods}>
                  {filteredData.neighborhoods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score || 0)} opacity={0.8} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">
            O tamanho dos círculos representa a população do bairro.
          </p>
        </section>
      </main>
    </div>
  );
}
