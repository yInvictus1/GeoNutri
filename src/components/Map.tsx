import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Neighborhood, Establishment, getScoreColor } from '../utils/data';
import { Store, MapPin, ExternalLink, Info, Users, CreditCard, ChevronRight } from 'lucide-react';

// Custom Location Button
function LocationButton() {
  const map = useMap();
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    map.on('locationfound', (e) => {
      setUserPos([e.latlng.lat, e.latlng.lng]);
    });
  }, [map]);

  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 13 });
  };

  return (
    <>
      <div className="absolute top-24 left-3 z-[1000] pointer-events-auto">
        <button 
          onClick={(e) => { e.preventDefault(); handleLocate(); }}
          className="bg-white w-[34px] h-[34px] flex items-center justify-center rounded-sm border-2 border-[rgba(0,0,0,0.2)] bg-clip-padding shadow-[0_1px_5px_rgba(0,0,0,0.65)] hover:bg-[#f4f4f4] text-slate-700 transition-colors"
          title="Minha Localização"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </button>
      </div>
      {userPos && (
        <Marker position={userPos}>
          <Popup>Você está aqui</Popup>
        </Marker>
      )}
    </>
  );
}

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types of establishments
const createIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });
};

const typeColors: Record<string, string> = {
  supermercado: '#3b82f6', // blue
  conveniência: '#f97316', // orange
  hortifrúti: '#22c55e', // green
  padaria: '#a855f7', // purple
  açougue: '#ef4444', // red
  mercado: '#166534', // dark green
  outro: '#6b7280' // gray
};

interface MapViewProps {
  neighborhoods: Neighborhood[];
  establishments: Establishment[];
  showHeatmap?: boolean;
}

// Heatmap Component
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    
    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default function MapView({ neighborhoods, establishments, showHeatmap }: MapViewProps) {
  const center: [number, number] = [-22.9068, -43.1729];
  const navigate = useNavigate();

  const heatPoints = useMemo<[number, number, number][]>(() => {
    return establishments.map(e => [e.lat, e.lon, 1]);
  }, [establishments]);

  return (
    <div className="relative h-[600px] w-full rounded-xl overflow-hidden shadow-md border border-slate-200">
      <MapContainer center={center} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <LocationButton />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {showHeatmap && <HeatmapLayer points={heatPoints} />}
        
        {/* Neighborhood Polygons */}
        {neighborhoods.map((n) => {
          const color = getScoreColor(n.score || 0);
          return (
            <Polygon
              key={n.id}
              positions={n.polygon}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.6,
                color: color,
                weight: 2,
                opacity: 0.8
              }}
            >
              <Tooltip sticky className="custom-tooltip">
                <div className="p-1 min-w-[180px]">
                  <h3 className="font-bold text-base border-b border-slate-200 pb-1 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {n.name}
                  </h3>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Score de Acesso:</span>
                      <strong className="px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: color }}>
                        {n.score?.toFixed(2)}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Estabelecimentos:</span>
                      <span className="font-semibold text-slate-700">{n.establishmentsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Renda Média:</span>
                      <span className="font-semibold text-slate-700">{n.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{n.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Rio de Janeiro, RJ</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Score</div>
                      <div className="text-xl font-black" style={{ color }}>{n.score?.toFixed(1)}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">População</div>
                      <div className="text-base font-bold text-slate-800">{n.population > 1000 ? `${(n.population/1000).toFixed(1)}k` : n.population}</div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Store className="w-4 h-4 opacity-50" />
                      <span>{n.establishmentsCount} estabelecimentos locais</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <CreditCard className="w-4 h-4 opacity-50" />
                      <span>Renda: {n.income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wide">Recursos Recomendados</p>
                    <div className="flex flex-col gap-1.5">
                      <a href="#" className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 font-medium group transition-colors">
                        Banco de Alimentos RJ
                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </a>
                      <a href="#" className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 font-medium group transition-colors">
                        SESC Mesa Brasil
                        <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* Establishment Markers */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
        >
          {establishments.map((est) => (
            <Marker 
              key={est.id} 
              position={[est.lat, est.lon]}
              icon={createIcon(typeColors[est.type] || typeColors.other)}
              eventHandlers={{
                click: () => {
                  navigate(`/estabelecimento/${est.id}`);
                }
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-start gap-2 mb-3">
                    <div 
                      className="mt-0.5 w-3 h-3 rounded-full shrink-0 border border-white shadow-sm" 
                      style={{ backgroundColor: typeColors[est.type] || typeColors.other }}
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight mb-1">{est.name}</h4>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase w-fit">
                        {est.type}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => navigate(`/estabelecimento/${est.id}`)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors group"
                    >
                      Ver Detalhes do Local
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                    
                    <a 
                      href={`https://www.google.com/maps?q=${est.lat},${est.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 text-[10px] font-medium transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google Maps
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-200 text-xs flex flex-col gap-4 pointer-events-auto">
        <div>
          <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">Score de Acesso</h4>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#ef4444]"></div><span className="text-slate-600 font-medium">0 - 3 (Crítico)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#f97316]"></div><span className="text-slate-600 font-medium">3 - 5 (Muito Baixo)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#eab308]"></div><span className="text-slate-600 font-medium">5 - 7 (Moderado)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#84cc16]"></div><span className="text-slate-600 font-medium">7 - 8.5 (Bom)</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#22c55e]"></div><span className="text-slate-600 font-medium">8.5 - 10 (Excelente)</span></div>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[10px]">Estabelecimentos</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }}></div>
                <span className="capitalize text-slate-600 font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
