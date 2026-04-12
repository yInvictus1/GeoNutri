import pandas as pd

def calculate_food_desert_score(gdf):
    """
    Calcula o score de deserto alimentar (0 a 10).
    Quanto MENOR o score, MAIOR o risco de deserto alimentar.
    
    Pesos:
    - Densidade de estabelecimentos por 1.000 habitantes (peso 40%)
    - Renda média do bairro normalizada (peso 30%)
    - Percentual de domicílios com saneamento básico (inverso do sem saneamento) (peso 30%)
    """
    df = gdf.copy()
    
    # 1. Densidade de estabelecimentos (por 1000 hab)
    df['densidade_estab'] = (df['num_estabelecimentos'] / df['populacao']) * 1000
    
    # Normalizar densidade (0 a 10)
    max_dens = df['densidade_estab'].max() if df['densidade_estab'].max() > 0 else 1
    df['score_densidade'] = (df['densidade_estab'] / max_dens) * 10
    
    # 2. Normalizar renda (0 a 10)
    max_renda = df['renda_media'].max()
    df['score_renda'] = (df['renda_media'] / max_renda) * 10
    
    # 3. Normalizar saneamento (0 a 10) - Inverter: mais sem saneamento = menor score
    df['score_saneamento'] = 10 - ((df['sem_saneamento_pct'] / 100) * 10)
    
    # Calcular score final
    df['score_final'] = (
        df['score_densidade'] * 0.4 +
        df['score_renda'] * 0.3 +
        df['score_saneamento'] * 0.3
    )
    
    # Garantir limites entre 0 e 10
    df['score_final'] = df['score_final'].clip(0, 10).round(2)
    
    return df
