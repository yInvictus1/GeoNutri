# 🍎 GeoNutri 

Uma aplicação web interativa e dashboard analítico para mapear e analisar o acesso a alimentos saudáveis em comunidades e bairros do Rio de Janeiro.

## 🎯 O Problema Social: Desertos e Pântanos Alimentares
"Desertos alimentares" são áreas urbanas onde os moradores têm dificuldade de acessar alimentos frescos, saudáveis e acessíveis (como hortifrutis e feiras locais). "Pântanos alimentares" são áreas onde há abundância de alimentos ultraprocessados (como lojas de conveniência) em detrimento de opções saudáveis. Essa desigualdade geográfica contribui diretamente para problemas de saúde pública, como obesidade, desnutrição e doenças crônicas.

O **GeoNutri** visa identificar essas áreas no Rio de Janeiro, unindo dados de mapas interativos e estimativas socioeconômicas, gerando um **Score de Acesso** interativo, ajudando gestores públicos e ONGs na tomada de decisão.

## ✨ Funcionalidades do MVP (Mínimo Produto Viável)
- **Mapa Geoespacial Interativo**: Visualização de bairros e concentração de estabelecimentos alimentares usando Leaflet.
- **Heatmap de Densidade**: Identificação visual rápida de polos comercias e áreas de escassez absoluta de alimentos.
- **Score de Acesso**: Uma pontuação de 0 a 10 calculada a partir da densidade de mercados, renda média e população do bairro.
- **Integração com OpenStreetMap (OSM)**: Busca de dados geoespaciais em tempo real de supermercados, hortifrutis, padarias e conveniências pela Overpass API, com fallback automático robusto.
- **Dashboard Analítico**: Gráficos dinâmicos usando Recharts comparando renda, acessibilidade e quantidade de estabelecimentos entre bairros.
- **Comparações Lado a Lado**: Selecione e compare múltiplos bairros detalhadamente.
- **Deep Linking**: Filtros de bairros e categorias refletidos na URL da página para o compartilhamento rápido de análises.
- **Exportação de Dados**: Download em CSV de todas as métricas geradas para análise em outras ferramentas.

## 🛠 Tecnologias Utilizadas
- **Frontend**: React 18 com Vite
- **Tipagem**: TypeScript
- **Estilização e Animações**: Tailwind CSS, Framer Motion
- **Mapas**: React Leaflet (`react-leaflet`), `leaflet.heat`
- **Visualização de Dados**: Recharts
- **Notificações e Ícones**: Sonner, Lucide React

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (versão 18+)
- npm, yarn ou pnpm

### Instalação

1. Clone o repositório e acesse a pasta do projeto:
```bash
git clone https://github.com/seu-usuario/geonutri.git
cd geonutri
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse em seu navegador via `http://localhost:3000` (ou a porta informada no terminal).

## 📊 Metodologia do Score
O Score de Acesso foi construído conceitualmente visando avaliar a resiliência alimentar da vizinhança.
Consiste nos seguintes pesos:
- **40% Densidade**: Relação entre o número de mercados e a população local.
- **30% Renda Média**: Poder de compra para a viabilidade de compra de itens saudáveis no local.
- **30% Saneamento e Infraestrutura**: Proxy de viabilidade comercial e investimento.

*(Nota: Este é um modelo inicial MVP. Modelos de produção mais granulares deverão incorporar tempos reais de deslocamento - isócronas - e classificação qualitativa baseada em avaliações em campo.)*

## 🗺 Roadmap de Evolução
- [ ] Integração com banco de dados em grafos / NoSQL para cache otimizado das requisições do OSM.
- [ ] Análises temporais baseadas em check-ins de abertura/fechamento de locais.
- [ ] Integração com roteamento de transporte público para calcular tempo real de deslocamento.
- [ ] Portal de governança com mapas colaborativos focados em comunidades.
- [ ] Inclusão da camada de feiras livres da prefeitura municipal.

## 📄 Licença
Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para obter mais informações.
