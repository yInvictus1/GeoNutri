import folium
from folium.plugins import MarkerCluster

def build_map(gdf_bairros, gdf_estabelecimentos):
    """
    Constrói o mapa interativo com Folium.
    """
    # Centro do Rio de Janeiro
    m = folium.Map(location=[-22.9068, -43.1729], zoom_start=11, tiles="CartoDB positron")
    
    # Adicionar Choropleth para os scores dos bairros
    # Cores: verde (bom acesso) -> amarelo -> vermelho (deserto alimentar)
    # Como o score menor é pior, usamos uma paleta RdYlGn
    
    folium.Choropleth(
        geo_data=gdf_bairros.to_json(),
        name="Risco de Deserto Alimentar",
        data=gdf_bairros,
        columns=["bairro", "score_final"],
        key_on="feature.properties.bairro",
        fill_color="RdYlGn",
        fill_opacity=0.7,
        line_opacity=0.2,
        legend_name="Score de Acesso Alimentar (0=Pior, 10=Melhor)",
        highlight=True
    ).add_to(m)
    
    # Adicionar popups para os bairros
    # Criar um GeoJson invisível apenas para os tooltips/popups
    style_function = lambda x: {'fillColor': '#ffffff', 'color':'#000000', 'fillOpacity': 0.0, 'weight': 0.1}
    highlight_function = lambda x: {'fillColor': '#000000', 'color':'#000000', 'fillOpacity': 0.1, 'weight': 1}
    
    bairros_info = folium.GeoJson(
        gdf_bairros,
        style_function=style_function,
        highlight_function=highlight_function,
        tooltip=folium.GeoJsonTooltip(
            fields=['bairro', 'score_final', 'num_estabelecimentos', 'renda_media'],
            aliases=['Bairro:', 'Score:', 'Estabelecimentos:', 'Renda Média (R$):'],
            localize=True
        ),
        popup=folium.GeoJsonPopup(
            fields=['bairro', 'score_final', 'num_estabelecimentos', 'renda_media'],
            aliases=['Bairro:', 'Score:', 'Estabelecimentos:', 'Renda Média (R$):'],
            localize=True
        )
    )
    bairros_info.add_to(m)
    
    # Adicionar marcadores de estabelecimentos com cluster
    marker_cluster = MarkerCluster(name="Estabelecimentos Alimentares").add_to(m)
    
    # Cores por tipo
    colors = {
        'supermarket': 'blue',
        'convenience': 'orange',
        'greengrocer': 'green',
        'bakery': 'purple',
        'butcher': 'red',
        'marketplace': 'darkgreen',
        'other': 'gray'
    }
    
    for idx, row in gdf_estabelecimentos.iterrows():
        tipo = row['tipo']
        color = colors.get(tipo, 'gray')
        
        folium.Marker(
            location=[row['lat'], row['lon']],
            popup=f"<b>{row['nome']}</b><br>Tipo: {tipo}",
            icon=folium.Icon(color=color, icon='info-sign')
        ).add_to(marker_cluster)
        
    folium.LayerControl().add_to(m)
    
    return m
