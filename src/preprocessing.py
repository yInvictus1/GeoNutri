import pandas as pd
import geopandas as gpd

def merge_data(gdf_bairros, df_estabelecimentos):
    """
    Cruza os dados de bairros com os estabelecimentos para contar quantos existem em cada bairro.
    """
    # Converter estabelecimentos para GeoDataFrame
    gdf_estabelecimentos = gpd.GeoDataFrame(
        df_estabelecimentos, 
        geometry=gpd.points_from_xy(df_estabelecimentos.lon, df_estabelecimentos.lat),
        crs="EPSG:4326"
    )
    
    # Fazer spatial join para contar estabelecimentos por bairro
    joined = gpd.sjoin(gdf_estabelecimentos, gdf_bairros, how="inner", predicate="within")
    
    # Contar por bairro
    contagem = joined.groupby('bairro').size().reset_index(name='num_estabelecimentos')
    
    # Mesclar de volta com o gdf de bairros
    gdf_final = gdf_bairros.merge(contagem, on='bairro', how='left')
    gdf_final['num_estabelecimentos'] = gdf_final['num_estabelecimentos'].fillna(0)
    
    return gdf_final, gdf_estabelecimentos
