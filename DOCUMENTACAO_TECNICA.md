# Documentação Técnica - NutriVita Foods ERP

## 1. Visão Geral
Este documento descreve a arquitetura de dados, o gerenciamento de estados (React `useState`) e as principais regras de negócio do simulador de suprimentos NutriVita Foods ERP. O código atual (App.jsx) foi projetado de forma modular (através de blocos lógicos) para facilitar futura integração com Firebase/Supabase e migração de componentes.

## 2. Estrutura de Estados (React State)
O sistema utiliza estados locais no componente principal para manter a reatividade de todas as abas simultaneamente:

*   `currentTab` (Number): Controla a navegação no menu lateral (1 a 6).
*   `isMissionControlOpen` (Boolean): Controla a visibilidade do painel flutuante do Docente.
*   `kpis` (Object): Monitora os indicadores do Dashboard em tempo real.
    *   `budget`: Orçamento disponível.
    *   `saving`: Economia gerada nas negociações.
    *   `serviceLevel`: Percentual de nível de serviço logístico.
    *   `occupation`: Ocupação do armazém (% seco e % câmara fria).
*   `mrpData` (Object): Variáveis preenchidas pelo aluno na Aba 2 para alimentar o Gráfico Dente de Serra.
*   `tcaData` (Object): Variáveis do Quadro de Apuração de Compras (TCA).
*   `suppliers` (Array): Lista de fornecedores disponíveis para homologação e cotação.
*   `evaluation` (Object): Dados da Rubrica de Avaliação formativa do aluno.

## 3. Regras de Negócio e Algoritmos

### 3.1. Fórmulas do MRP (Gráfico Dente de Serra)
O módulo de Planejamento de Materiais baseia-se nas seguintes fórmulas logísticas padrão:
*   **Ponto de Pedido (PP)** = (Consumo Médio Diário × Lead Time) + Estoque Mínimo
*   **Estoque Máximo (EMax)** = Estoque Mínimo + Lote de Compra (Q)
*   **Curva de Consumo:** Plotada via SVG calculando o decaimento linear da cota $EMax$ até a cota $EMin$ num período de $T$ dias.

### 3.2. Rubrica de Avaliação Logística (Métrica de Desempenho)
O sistema de avaliação do Mission Control classifica o aluno com base no atingimento de critérios técnicos e socioemocionais:
*   **Fórmula de Percentual:** `(Critérios Atendidos [A] / Total de Critérios) * 100`
*   **Enquadramento de Níveis:**
    *   Nível 1 (Abaixo de 20%): Exige intervenção.
    *   Nível 2 (21% a 40%): Desenvolvimento incipiente.
    *   Nível 3 (41% a 60%): Desenvolvimento parcial.
    *   Nível 4 (61% a 80%): Padrão de aprovação esperado.
    *   Nível 5 (81% a 99%): Desempenho superior.
    *   Nível 6 (100%): Excelência plena.

### 3.3. Dinâmicas de Professor (Injeção de Crises)
*   **Câmbio:** A atualização do dólar/euro afeta imediatamente o TCA na aba 4.
*   **Desafio "Laranja Ugli":** Um toggle que força o aluno a realizar uma "
