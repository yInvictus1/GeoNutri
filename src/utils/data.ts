export interface Neighborhood {
  id: string;
  name: string;
  population: number;
  income: number;
  noSanitationPct: number;
  center: [number, number];
  polygon: [number, number][];
  score?: number;
  establishmentsCount?: number;
}

export interface Establishment {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  neighborhoodId?: string;
}

const NEIGHBORHOOD_NAMES = [
  "Copacabana", "Ipanema", "Leblon", "Botafogo", "Flamengo",
  "Tijuca", "Vila Isabel", "Maracanã", "Grajaú", "Andaraí",
  "Méier", "Engenho Novo", "Lins de Vasconcelos", "Cachambi", "Todos os Santos",
  "Madureira", "Oswaldo Cruz", "Campinho", "Cascadura", "Quintino Bocaiúva",
  "Bangu", "Realengo", "Padre Miguel", "Santíssimo", "Senador Camará",
  "Campo Grande", "Santa Cruz", "Paciência", "Sepetiba", "Guaratiba"
];

export const TYPE_TRANSLATIONS: Record<string, string> = {
  supermarket: 'supermercado',
  convenience: 'conveniência',
  greengrocer: 'hortifrúti',
  bakery: 'padaria',
  butcher: 'açougue',
  marketplace: 'mercado',
  other: 'outro'
};

const ESTABLISHMENT_TYPES = ['supermercado', 'conveniência', 'hortifrúti', 'padaria', 'açougue', 'mercado'];

// Helper to generate more realistic, irregular polygons instead of perfect squares
function generateRealisticPolygon(centerLat: number, centerLon: number, baseRadius: number, numPoints: number = 8): [number, number][] {
  const polygon: [number, number][] = [];
  // Use a pseudo-random seed based on coordinates so the polygon shape is consistent
  let seed = Math.abs(centerLat * centerLon * 100000);
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // Randomize radius between 0.7x and 1.3x of base radius for an irregular shape
    const r = baseRadius * (0.7 + random() * 0.6);
    
    // Adjust longitude based on latitude to maintain shape proportions
    const latOffset = r * Math.sin(angle);
    const lonOffset = (r * Math.cos(angle)) / Math.cos(centerLat * Math.PI / 180);
    
    polygon.push([centerLat + latOffset, centerLon + lonOffset]);
  }
  return polygon;
}

export function generateSyntheticData() {
  const baseLat = -22.9068;
  const baseLon = -43.1729;

  const neighborhoods: Neighborhood[] = NEIGHBORHOOD_NAMES.map((name, i) => {
    const lat = baseLat + (Math.random() * 0.3 - 0.2);
    const lon = baseLon + (Math.random() * 0.5 - 0.4);
    
    const size = 0.015;
    const polygon = generateRealisticPolygon(lat, lon, size, 10);

    return {
      id: `n_${i}`,
      name,
      population: Math.floor(Math.random() * 90000) + 10000,
      income: Math.random() * 14000 + 1000,
      noSanitationPct: Math.random() * 40,
      center: [lat, lon],
      polygon
    };
  });

  const establishments: Establishment[] = Array.from({ length: 300 }).map((_, i) => {
    const lat = baseLat + (Math.random() * 0.3 - 0.2);
    const lon = baseLon + (Math.random() * 0.5 - 0.4);
    const type = ESTABLISHMENT_TYPES[Math.floor(Math.random() * ESTABLISHMENT_TYPES.length)];
    
    return {
      id: `e_${i}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Fictício ${Math.floor(Math.random() * 1000)}`,
      type,
      lat,
      lon
    };
  });

  return { neighborhoods, establishments };
}

const REAL_NEIGHBORHOODS_DATA = [
  { id: "n_copacabana", name: "Copacabana", population: 146392, income: 8000, noSanitationPct: 1.2, center: [-22.9711, -43.1822] },
  { id: "n_leblon", name: "Leblon", population: 46044, income: 15000, noSanitationPct: 0.5, center: [-22.9845, -43.2228] },
  { id: "n_tijuca", name: "Tijuca", population: 163805, income: 5500, noSanitationPct: 3.5, center: [-22.9333, -43.2381] },
  { id: "n_bangu", name: "Bangu", population: 243125, income: 1800, noSanitationPct: 15.0, center: [-22.8764, -43.4650] },
  { id: "n_madureira", name: "Madureira", population: 49546, income: 2200, noSanitationPct: 8.0, center: [-22.8761, -43.3384] },
  { id: "n_rocinha", name: "Rocinha", population: 69161, income: 1200, noSanitationPct: 25.0, center: [-22.9886, -43.2485] },
  { id: "n_centro", name: "Centro", population: 41142, income: 3500, noSanitationPct: 5.0, center: [-22.9068, -43.1729] },
  { id: "n_campo_grande", name: "Campo Grande", population: 328370, income: 1900, noSanitationPct: 18.0, center: [-22.9035, -43.5596] },
  { id: "n_meier", name: "Méier", population: 51298, income: 3800, noSanitationPct: 4.0, center: [-22.9015, -43.2800] },
  { id: "n_santa_cruz", name: "Santa Cruz", population: 217333, income: 1500, noSanitationPct: 22.0, center: [-22.9186, -43.6842] },
  { id: "n_botafogo", name: "Botafogo", population: 82890, income: 9000, noSanitationPct: 1.0, center: [-22.9519, -43.1837] },
  { id: "n_complexo_alemao", name: "Complexo do Alemão", population: 69143, income: 1100, noSanitationPct: 20.0, center: [-22.8592, -43.2755] },
  { id: "n_barra_tijuca", name: "Barra da Tijuca", population: 135924, income: 12000, noSanitationPct: 2.0, center: [-23.0004, -43.3659] },
  { id: "n_jacarepagua", name: "Jacarepaguá", population: 157326, income: 3000, noSanitationPct: 10.0, center: [-22.9675, -43.3981] },
  { id: "n_penha", name: "Penha", population: 63636, income: 2500, noSanitationPct: 7.0, center: [-22.8340, -43.2770] }
];

export const REAL_NEIGHBORHOODS: Neighborhood[] = REAL_NEIGHBORHOODS_DATA.map(n => {
  const size = 0.02; // Roughly 2.2km radius to capture establishments
  const lat = n.center[0];
  const lon = n.center[1];
  return {
    ...n,
    center: n.center as [number, number],
    polygon: generateRealisticPolygon(lat, lon, size, 12)
  };
});

let cachedRealData: { neighborhoods: Neighborhood[], establishments: Establishment[] } | null = null;

export async function loadRealData() {
  if (cachedRealData) {
    return cachedRealData;
  }

  const neighborhoods = REAL_NEIGHBORHOODS.map(n => ({ ...n }));
  let establishments: Establishment[] = [];
  
  try {
    const query = `[out:json][timeout:25];
(
  node["shop"~"supermarket|convenience|greengrocer|bakery|butcher"](-23.05,-43.75,-22.75,-43.10);
  node["amenity"="marketplace"](-23.05,-43.75,-22.75,-43.10);
);
out center 1500;`;
    
    let response;
    let errors = [];
    const endpoints = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter'
    ];

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`
        });
        if (response.ok) break;
      } catch (e) {
        errors.push(e);
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`All OSM endpoints failed: ${errors.map((e: any) => e.message).join(', ')}`);
    }
    
    const data = await response.json();
    
    establishments = data.elements.map((el: any) => {
      const rawType = el.tags.shop || el.tags.amenity || 'other';
      const translatedType = TYPE_TRANSLATIONS[rawType] || 'outro';
      
      return {
        id: `osm_${el.id}`,
        name: el.tags.name || `${translatedType.toUpperCase()}`,
        type: translatedType,
        lat: el.lat,
        lon: el.lon
      };
    });
  } catch (error) {
    console.warn("Aviso: Não foi possível acessar o OpenStreetMap. Usando dados sintéticos como fallback.");
    establishments = generateSyntheticData().establishments;
  }
  
  cachedRealData = processScores(neighborhoods, establishments);
  return cachedRealData;
}

function isPointInPolygon(point: [number, number], vs: [number, number][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function processScores(neighborhoods: Neighborhood[], establishments: Establishment[]) {
  neighborhoods.forEach(n => n.establishmentsCount = 0);

  establishments.forEach(est => {
    for (const n of neighborhoods) {
      if (isPointInPolygon([est.lat, est.lon], n.polygon)) {
        est.neighborhoodId = n.id;
        n.establishmentsCount = (n.establishmentsCount || 0) + 1;
        break;
      }
    }
  });

  const maxIncome = Math.max(...neighborhoods.map(n => n.income));
  const maxDensity = Math.max(...neighborhoods.map(n => ((n.establishmentsCount || 0) / n.population) * 1000)) || 1;

  neighborhoods.forEach(n => {
    const density = ((n.establishmentsCount || 0) / n.population) * 1000;
    const scoreDensity = (density / maxDensity) * 10;
    const scoreIncome = (n.income / maxIncome) * 10;
    const scoreSanitation = 10 - ((n.noSanitationPct / 100) * 10);
    
    let finalScore = (scoreDensity * 0.4) + (scoreIncome * 0.3) + (scoreSanitation * 0.3);
    finalScore = Math.max(0, Math.min(10, finalScore));
    n.score = Number(finalScore.toFixed(2));
  });

  return { neighborhoods, establishments };
}

export function getScoreColor(score: number) {
  if (score < 3) return '#ef4444'; // Red
  if (score < 5) return '#f97316'; // Orange
  if (score < 7) return '#eab308'; // Yellow
  if (score < 8.5) return '#84cc16'; // Light Green
  return '#22c55e'; // Green
}
