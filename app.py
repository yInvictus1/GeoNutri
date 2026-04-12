import streamlit as st
import pandas as pd
import plotly.express as px
from streamlit_folium import st_folium

from src.data_loader import load_socioeconomic_data
from src.osm_fetcher import fetch_osm_data
from src.preprocessing import merge_data
from src.scoring import calculate_food_desert_score
from src.map_builder import build_map

# Configuração da página
st.set_page_config(
    page_title="Desertos Alimentares RJ",
    page_icon="🍎",
    layout="wide"
)

# Cache de dados
@st.cache_data
def load_all_data(use_synthetic=True):
    with st.spinner("Carregando dados socioeconômicos..."):
        gdf_bairros = load_socioeconomic_data(use_synthetic)
    
    with st.spinner("Buscando estabelecimentos alimentares..."):
        df_estabelecimentos = fetch_osm_data(use_synthetic)
        
    with st.spinner("Processando dados e calculando scores..."):
        gdf_merged, gdf_estab = merge_data(gdf_bairros, df_estabelecimentos)
        gdf_scored = calculate_food_desert_score(gdf_merged)
        
    return gdf_scored, gdf_estab

# Header
st.title("🍎 Desertos Alimentares RJ")
st.markdown("""
**Mapeamento do acesso a alimentos saudáveis em comunidades vulneráveis do Rio de Janeiro.**
Este projeto cruza dados socioeconômicos com a localização de estabelecimentos alimentares para identificar regiões com baixo acesso a alimentos frescos.
""")

# Controle de dados sintéticos
use_synthetic = st.sidebar.checkbox("Usar Dados Sintéticos (Modo Offline/Demo)", value=True)

if use_synthetic:
    st.warning("⚠️ **Modo Demo Ativo:** Exibindo dados sintéticos gerados aleatoriamente para fins de demonstração.")

# Carregar dados
try:
    gdf_bairros, gdf_estabelecimentos = load_all_data(use_synthetic)
except Exception as e:
    st.error(f"Erro ao carregar os dados: {e}")
    st.stop()

# Sidebar - Filtros
st.sidebar.header("Filtros")

# Filtro de Bairros
bairros_list = sorted(gdf_bairros['bairro'].tolist())
bairros_selecionados = st.sidebar.multiselect("Selecione os Bairros", bairros_list, default=[])

# Filtro de Tipos de Estabelecimento
tipos_list = sorted(gdf_estabelecimentos['tipo'].unique().tolist())
tipos_selecionados = st.sidebar.multiselect("Tipos de Estabelecimento", tipos_list, default=tipos_list)

# Aplicar filtros
if bairros_selecionados:
    gdf_bairros_filtered = gdf_bairros[gdf_bairros['bairro'].isin(bairros_selecionados)]
else:
    gdf_bairros_filtered = gdf_bairros

if tipos_selecionados:
    gdf_estab_filtered = gdf_estabelecimentos[gdf_estabelecimentos['tipo'].isin(tipos_selecionados)]
else:
    gdf_estab_filtered = gdf_estabelecimentos

# Métricas Principais
st.header("📊 Visão Geral")
col1, col2, col3, col4 = st.columns(4)

total_bairros = len(gdf_bairros_filtered)
bairros_criticos = len(gdf_bairros_filtered[gdf_bairros_filtered['score_final'] < 4.0])
total_estabelecimentos = len(gdf_estab_filtered)
populacao_risco = gdf_bairros_filtered[gdf_bairros_filtered['score_final'] < 4.0]['populacao'].sum()

col1.metric("Bairros Analisados", total_bairros)
col2.metric("Bairros em Situação Crítica", bairros_criticos, help="Score < 4.0")
col3.metric("Estabelecimentos Mapeados", total_estabelecimentos)
col4.metric("População em Risco Estimada", f"{populacao_risco:,}".replace(",", "."))

# Mapa Interativo
st.header("🗺️ Mapa de Acesso Alimentar")
st.markdown("Cores mais quentes (vermelho) indicam maior risco de deserto alimentar (menor score).")

m = build_map(gdf_bairros_filtered, gdf_estab_filtered)
st_folium(m, width=1200, height=600, returned_objects=[])

# Análises Detalhadas
st.header("📈 Análises Detalhadas")
col_chart, col_table = st.columns([1, 1])

with col_chart:
    st.subheader("Top 10 Bairros com Menor Acesso")
    top_10 = gdf_bairros_filtered.nsmallest(10, 'score_final')
    fig = px.bar(
        top_10, 
        x='score_final', 
        y='bairro', 
        orientation='h',
        color='score_final',
        color_continuous_scale='RdYlGn',
        labels={'score_final': 'Score', 'bairro': 'Bairro'}
    )
    fig.update_layout(yaxis={'categoryorder':'total ascending'})
    st.plotly_chart(fig, use_container_width=True)

with col_table:
    st.subheader("Tabela de Scores por Bairro")
    df_display = gdf_bairros_filtered[['bairro', 'score_final', 'num_estabelecimentos', 'renda_media', 'populacao']].copy()
    df_display = df_display.sort_values('score_final').reset_index(drop=True)
    df_display['renda_media'] = df_display['renda_media'].apply(lambda x: f"R$ {x:.2f}")
    st.dataframe(df_display, use_container_width=True)

# Footer
st.markdown("---")
st.markdown("""
**Fontes de Dados:**
- Limites de Bairros e Dados Socioeconômicos: IBGE (Censo 2022)
- Estabelecimentos Alimentares: OpenStreetMap via Overpass API

*Projeto desenvolvido para fins de impacto social.*
""")
