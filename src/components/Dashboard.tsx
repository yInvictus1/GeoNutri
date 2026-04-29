import React, { useState, useMemo, useEffect } from 'react';
import { generateSyntheticData, loadRealData, processScores, Neighborhood, Establishment, getScoreColor, TYPE_TRANSLATIONS } from '../utils/data';
import MapView from './Map';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { AlertTriangle, MapPin, Users, Store, Info, Search, Filter, Download, Navigation2, BarChart3, Layers, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<{ neighborhoods: Neighborhood[], establishments: Establishment[] } | null>(null);
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [comparedNeighborhoods, setComparedNeighborhoods] = useState<string[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Custom hook extracting filter state logic to URL (Deep Linking)
  const { 
    selectedNeighborhoods, 
    toggleNeighborhood, 
    clearNeighborhoods,
    selectedTypes, 
    toggleType, 
    useRealData, 
    setRealDataMode 
  } = useDashboardFilters();

  const toggleComparison = (name: string) => {
    setComparedNeighborhoods(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name);
      if (prev.length >= 2) return [prev[1], name];
      return [...prev, name];
    });
  };

  const comparisonData = useMemo(() => {
    if (!data || comparedNeighborhoods.length === 0) return [];
    return data.neighborhoods.filter(n => comparedNeighborhoods.includes(n.name));
  }, [data, comparedNeighborhoods]);

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

  const selectedEstablishment = useMemo(() => {
    if (!id || !data) return null;
    return data.establishments.find(e => e.id === id) || null;
  }, [data, id]);

  const establishmentNeighborhood = useMemo(() => {
    if (!selectedEstablishment || !data) return null;
    return data.neighborhoods.find(n => n.id === selectedEstablishment.neighborhoodId);
  }, [selectedEstablishment, data]);

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
      <motion.aside 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 overflow-y-auto"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2 mb-2">
            <span className="text-3xl">🍎</span> Desertos Alimentares RJ
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Mapeamento do acesso a alimentos saudáveis em comunidades vulneráveis do Rio de Janeiro.
          </p>
        </div>

        <div className="mb-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <label className="flex items-center cursor-pointer mb-3">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={useRealData}
                onChange={() => setRealDataMode(!useRealData)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${useRealData ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useRealData ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-medium text-slate-700">
              Usar Dados Reais (IBGE)
            </div>
          </label>

          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={showHeatmap}
                onChange={() => setShowHeatmap(!showHeatmap)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showHeatmap ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showHeatmap ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm font-medium text-slate-700">
              Exibir Heatmap de Densidade
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
                    onClick={clearNeighborhoods}
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
                        className={`group flex items-center px-2.5 py-1.5 rounded cursor-pointer transition-colors mb-0.5 ${isSelected ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-700'}`}
                      >
                        <div 
                          className="flex items-center flex-1 min-w-0"
                          onClick={() => toggleNeighborhood(name)}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2.5 transition-colors shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                            {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm select-none truncate">{name}</span>
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleComparison(name); }}
                          title="Adicionar para Comparação"
                          className={`ml-1 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 ${comparedNeighborhoods.includes(name) ? 'bg-blue-100 text-blue-600 opacity-100' : 'text-slate-400 hover:bg-slate-200'}`}
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </button>
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
                      onChange={() => toggleType(type, allTypes)}
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
      </motion.aside>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 p-6 md:p-8 overflow-y-auto"
      >
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
          {[
            { label: 'Bairros Analisados', value: metrics.total, icon: MapPin, color: 'blue' },
            { label: 'Situação Crítica', value: metrics.critical, icon: AlertTriangle, color: 'red', sub: 'Score < 4.0' },
            { label: 'Estabelecimentos', value: metrics.estCount, icon: Store, color: 'emerald' },
            { label: 'População em Risco', value: metrics.popRisk.toLocaleString('pt-BR'), icon: Users, color: 'amber' }
          ].map((card, i) => (
            <motion.div 
              key={card.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + (i * 0.05) }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4"
            >
              <div className={`p-3 bg-${card.color}-50 text-${card.color}-600 rounded-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                {card.sub && <p className="text-xs text-slate-400 mt-1">{card.sub}</p>}
              </div>
            </motion.div>
          ))}
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
          <MapView 
            neighborhoods={filteredData.neighborhoods} 
            establishments={filteredData.establishments} 
            showHeatmap={showHeatmap}
          />
        </section>

        {/* Charts and Tables */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-w-0">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Top 10 Bairros com Menor Acesso</h3>
            <div className="h-80 w-full min-w-0 flex-1" style={{ minHeight: 320 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
          <div className="h-[400px] w-full min-w-0" style={{ minHeight: 400 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200 text-sm">
                          <p className="font-bold text-slate-800 mb-2">{data.name}</p>
                          <div className="flex flex-col gap-1">
                            <p className="text-slate-600"><span className="font-medium text-slate-500">Renda Média:</span> R$ {data.income.toFixed(2)}</p>
                            <p className="text-slate-600"><span className="font-medium text-slate-500">Score:</span> {data.score?.toFixed(2)}</p>
                            <p className="text-slate-600"><span className="font-medium text-slate-500">População:</span> {data.population.toLocaleString('pt-BR')} hab.</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
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
      </motion.main>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {comparedNeighborhoods.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-[90%] max-w-4xl"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 overflow-hidden">
              <div className="bg-blue-600 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold">
                  <BarChart3 className="w-5 h-5" />
                  Comparação de Bairros ({comparedNeighborhoods.length}/2)
                </div>
                <button onClick={() => setComparedNeighborhoods([])} className="text-blue-100 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gradient-to-br from-white to-blue-50">
                {comparisonData.map((n, idx) => (
                  <div key={n.id} className={`${idx === 0 && comparisonData.length > 1 ? 'border-r border-blue-100 pr-8' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-slate-800">{n.name}</h4>
                      <div 
                        className="px-3 py-1 rounded-full text-white font-bold text-sm"
                        style={{ backgroundColor: getScoreColor(n.score || 0) }}
                      >
                        Score: {n.score?.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Renda Média</span>
                        <span className="font-bold text-slate-700">{n.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (n.income / 15000) * 100)}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">População</span>
                        <span className="font-bold text-slate-700">{n.population.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (n.population / 200000) * 100)}%` }}></div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Estabelecimentos</span>
                        <span className="font-bold text-slate-700">{n.establishmentsCount}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full" style={{ width: `${Math.min(100, (n.establishmentsCount / 500) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
                {comparisonData.length === 1 && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 p-8 text-center">
                    <Layers className="w-8 h-8 text-blue-300 mb-2" />
                    <p className="text-blue-500 font-medium">Selecione outro bairro para comparar</p>
                    <p className="text-xs text-blue-400 mt-1">Clique no ícone de gráfico na lista de bairros</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Establishment Details Sidebar */}
      <AnimatePresence>
        {selectedEstablishment && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[9998] transition-opacity md:hidden"
              onClick={() => navigate('/')}
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] z-[9999] border-l border-slate-200 flex flex-col"
            >
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                Detalhes do Estabelecimento
              </h3>
              <button 
                onClick={() => navigate('/')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
                title="Fechar (Esc)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full capitalize mb-3 border border-emerald-200">
                  {selectedEstablishment.type}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedEstablishment.name}</h2>
                <div className="flex items-center gap-1.5 text-slate-500 mt-2 text-sm">
                  <Navigation2 className="w-4 h-4" />
                  <span>Lat: {selectedEstablishment.lat.toFixed(6)}, Lon: {selectedEstablishment.lon.toFixed(6)}</span>
                </div>
              </div>

              {establishmentNeighborhood && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Bairro Associado
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-xl font-bold text-slate-900">{establishmentNeighborhood.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500">Score de Acesso:</span>
                        <span 
                          className="font-bold rounded text-white px-2 py-0.5 text-xs inline-block"
                          style={{ backgroundColor: getScoreColor(establishmentNeighborhood.score || 0) }}
                        >
                          {establishmentNeighborhood.score?.toFixed(2)} / 10
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-sm">
                      <div>
                        <span className="text-slate-500 block mb-1">População</span>
                        <strong className="text-slate-800">{establishmentNeighborhood.population.toLocaleString('pt-BR')} hab.</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Renda Média</span>
                        <strong className="text-slate-800">{establishmentNeighborhood.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-8">
                <a 
                  href={`https://www.google.com/maps?q=${selectedEstablishment.lat},${selectedEstablishment.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Ver no Google Maps
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    </div>
  );
}
