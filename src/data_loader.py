import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Polygon

def generate_synthetic_neighborhoods():
    """
    Gera dados sintéticos de 30 bairros do Rio de Janeiro para fallback.
    """
    np.random.seed(42)
    
    bairros_nomes = [
        "Copacabana", "Ipanema", "Leblon", "Botafogo", "Flamengo",
        "Tijuca", "Vila Isabel", "Maracanã", "Grajaú", "Andaraí",
        "Méier", "Engenho Novo", "Lins de Vasconcelos", "Cachambi", "Todos os Santos",
        "Madureira", "Oswaldo Cruz", "Campinho", "Cascadura", "Quintino Bocaiúva",
        "Bangu", "Realengo", "Padre Miguel", "Santíssimo", "Senador Camará",
        "Campo Grande", "Santa Cruz", "Paciência", "Sepetiba", "Guaratiba"
    ]
    
    # Coordenadas aproximadas (lat, lon)
    base_lat, base_lon = -22.9068, -43.1729
    
    data = []
    for i, nome in enumerate(bairros_nomes):
        # Gerar um polígono simples ao redor de um ponto central
        lat = base_lat + np.random.uniform(-0.2, 0.1)
        lon = base_lon + np.random.uniform(-0.4, 0.1)
        
        # Criar um quadrado pequeno como polígono do bairro
        poly = Polygon([
            (lon - 0.01, lat - 0.01),
            (lon + 0.01, lat - 0.01),
            (lon + 0.01, lat + 0.01),
            (lon - 0.01, lat + 0.01)
        ])
        
        populacao = np.random.randint(10000, 100000)
        renda_media = np.random.uniform(1000, 15000)
        sem_saneamento = np.random.uniform(0, 40) # %
        
        data.append({
            "bairro": nome,
            "populacao": populacao,
            "renda_media": renda_media,
            "sem_saneamento_pct": sem_saneamento,
            "geometry": poly,
            "lat_center": lat,
            "lon_center": lon
        })
        
    gdf = gpd.GeoDataFrame(data, geometry="geometry", crs="EPSG:4326")
    return gdf

def load_socioeconomic_data(use_synthetic=True):
    """
    Carrega dados socioeconômicos. Usa dados sintéticos se solicitado ou se falhar.
    """
    if use_synthetic:
        return generate_synthetic_neighborhoods()
    
    # Aqui entraria a lógica para carregar dados reais do IBGE
    # Como fallback, retornamos os sintéticos
    return generate_synthetic_neighborhoods()
