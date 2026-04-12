import requests
import pandas as pd
import numpy as np

def fetch_osm_data(use_synthetic=True, bounds=None):
    """
    Busca estabelecimentos alimentares na Overpass API.
    """
    if use_synthetic:
        return generate_synthetic_establishments()
        
    # Lógica real da Overpass API
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = """
    [out:json];
    area["name"="Rio de Janeiro"]->.searchArea;
    (
      node["shop"~"supermarket|convenience|greengrocer|bakery|butcher"](area.searchArea);
      node["amenity"="marketplace"](area.searchArea);
    );
    out center;
    """
    try:
        response = requests.get(overpass_url, params={'data': overpass_query}, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        establishments = []
        for element in data['elements']:
            tags = element.get('tags', {})
            establishments.append({
                'nome': tags.get('name', 'Desconhecido'),
                'tipo': tags.get('shop', tags.get('amenity', 'other')),
                'lat': element.get('lat'),
                'lon': element.get('lon')
            })
            
        return pd.DataFrame(establishments)
    except Exception as e:
        print(f"Erro ao buscar dados do OSM: {e}. Usando dados sintéticos.")
        return generate_synthetic_establishments()

def generate_synthetic_establishments():
    """
    Gera estabelecimentos sintéticos espalhados pelo RJ.
    """
    np.random.seed(42)
    tipos = ['supermarket', 'convenience', 'greengrocer', 'bakery', 'butcher', 'marketplace']
    
    base_lat, base_lon = -22.9068, -43.1729
    
    data = []
    for _ in range(300):
        lat = base_lat + np.random.uniform(-0.2, 0.1)
        lon = base_lon + np.random.uniform(-0.4, 0.1)
        tipo = np.random.choice(tipos)
        
        data.append({
            'nome': f"{tipo.capitalize()} Fictício {np.random.randint(1, 1000)}",
            'tipo': tipo,
            'lat': lat,
            'lon': lon
        })
        
    return pd.DataFrame(data)
