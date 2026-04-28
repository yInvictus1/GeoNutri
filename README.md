# 🍎 Desertos Alimentares RJ

Uma aplicação web interativa para mapear e analisar o acesso a alimentos saudáveis em comunidades vulneráveis do Rio de Janeiro.

## 🎯 O Problema Social
"Desertos alimentares" são áreas urbanas onde os moradores têm dificuldade de acessar alimentos frescos, saudáveis e acessíveis (como frutas, verduras e legumes). Geralmente, essas regiões possuem apenas opções de alimentos ultraprocessados, o que contribui para problemas de saúde pública, como obesidade e desnutrição.

Este projeto visa identificar essas áreas no Rio de Janeiro cruzando dados socioeconômicos do IBGE com a localização de estabelecimentos alimentares (supermercados, feiras, hortifrútis) do OpenStreetMap.

## 📸 Screenshot
<img width="1901" height="1016" alt="image" src="https://github.com/user-attachments/assets/4d59e728-e4ec-4c53-83ba-d3276c83f071" />

## 🚀 Como Executar Localmente

### Pré-requisitos
- Python 3.11+
- Pip

### Instalação
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/desertos-alimentares-rj.git
cd desertos-alimentares-rj
```

2. Crie um ambiente virtual (recomendado):
```bash
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Execute a aplicação:
```bash
streamlit run app.py
```

## 📂 Estrutura do Projeto
```text
desertos-alimentares-rj/
├── app.py                  # Entrada principal do Streamlit
├── requirements.txt        # Dependências do projeto
├── README.md               # Documentação
├── data/
│   ├── raw/                # Dados brutos do IBGE e OSM
│   └── processed/          # Dados tratados e prontos para uso
├── src/
│   ├── __init__.py
│   ├── data_loader.py      # Funções para carregar e baixar dados
│   ├── osm_fetcher.py      # Integração com a Overpass API (OpenStreetMap)
│   ├── preprocessing.py    # Limpeza, merge e geração do índice
│   ├── scoring.py          # Lógica do índice de deserto alimentar
│   └── map_builder.py      # Geração do mapa com Folium
└── notebooks/
    └── exploratory_analysis.ipynb
```

## 🛠️ Tecnologias Utilizadas
- **Frontend/Dashboard:** Streamlit
- **Manipulação de Dados:** Pandas, GeoPandas, Numpy
- **Visualização de Mapas:** Folium, streamlit-folium
- **Gráficos:** Plotly
- **APIs:** Requests (Overpass API)

## 🔄 Como Obter Dados Reais do IBGE
O MVP atual utiliza dados sintéticos para facilitar a demonstração e desenvolvimento offline. Para utilizar dados reais:
1. Baixe os dados do Censo 2022 no portal do IBGE (SIDRA) ou malhas territoriais.
2. Salve os arquivos CSV/Shapefile na pasta `data/raw/`.
3. Modifique a função `load_socioeconomic_data` em `src/data_loader.py` para ler os arquivos reais.
4. Desmarque a opção "Usar Dados Sintéticos" na barra lateral do aplicativo.

## 🗺️ Próximos Passos (Roadmap)
- [ ] Integração automática com a API SIDRA do IBGE.
- [ ] Adição de rotas de transporte público para calcular tempo de deslocamento até o mercado mais próximo.
- [ ] Inclusão de dados de feiras livres da Prefeitura do Rio de Janeiro.
- [ ] Exportação de relatórios em PDF para gestores públicos.

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
