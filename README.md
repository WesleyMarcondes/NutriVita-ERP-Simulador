# NutriVita Foods ERP - Simulador Educacional de Suprimentos & Logística

Simulador educacional de ERP corporativo para o ensino prático de Suprimentos, Logística Integrada e Planejamento de Materiais (MRP). Desenvolvido em **React**, **Vite** e **Tailwind CSS**, com versão interativa standalone integrada.

---

## 🎯 Visão Geral
O **NutriVita Foods ERP** simula o cotidiano do departamento de Suprimentos de uma indústria alimentícia localizada em Extrema/MG. Como analista responsável, o estudante vivencia todas as etapas da cadeia de suprimentos:
1. Recebimento e priorização de Requisições de Compras (RCs).
2. Cálculo de parâmetros de estoque e geração da curva Dente de Serra no MRP.
3. Auditoria documental e homologação de fornecedores (IQF) com conformidade técnica.
4. Negociação corporativa via Webmail com persistência de mensagens e réplicas realistas.
5. Emissão de Pedido de Compra (PO) com precificação de frete, seguro e Incoterms 2020.
6. Rastreamento Inbound na Torre de Follow-up com avanço orgânico de 5 marcos e atualização física do estoque fabril.

---

## 🧭 Arquitetura Pedagógica (Módulos da Simulação)

* **0. Dossiê Inicial & Onboarding:** Contextualização da fábrica, metas corporativas do trimestre, ciclo de compras e políticas da empresa (SOP).
* **1. Dashboard & Requisições (RCs):** Monitoramento de KPIs estratégicos (Orçamento, Saving, Nível de Serviço OTIF, Ocupação do Armazém) com modais de letramento técnico e caixa de entrada dinâmica de RCs com trilha pedagógica integrada (16% a 100%).
* **2. Calculadora MRP & Gráfico Dente de Serra:** Dimensionamento de Consumo Médio ($CM$), Lead Time ($LT$), Estoque Mínimo ($EMin$) e Lote de Reposição ($Q$). Trava técnica que exige a correta interpretação das recomendações conceituais da fábrica para liberar o fluxo.
* **3. Homologação & Auditoria IQF:** Dossiês legais de fornecedores nacionais e internacionais, auditoria manual por checklist (Alvará, CND, ISO 22000, Saúde Financeira), trava anti-fraude documental e cadastro de novos parceiros.
* **4. Webmail Corporativo:** Interface inspirada no Outlook corporativo com histórico persistente por thread, cronômetro de resposta humanizado e randômico, badges e notificações multimodulares.
* **5. Emissão de Pedidos (PO):** Card em destaque do fornecedor homologado, catálogo oficial de insumos com busca em tempo real, cálculo automático de frete e seguro por Incoterm e modal, matriz comparativa Incoterms 2020 e modal de sucesso com protocolo.
* **6. Torre de Follow-up Inbound:** Rastreamento simultâneo de cargas, linha do tempo com 5 marcos operacionais, cronômetro de trânsito em tempo real, diário de bordo cronológico e gatilho de abastecimento físico do armazém (+12% de ocupação).

---

## 👨‍🏫 Mission Control (Painel Docente)
Painel exclusivo para o educador orquestrar a dinâmica da sala de aula:
* **Gatilho de Trânsito Inbound:** Avanço manual instantâneo de marcos ou alternância do trânsito automático orgânico (35s).
* **Injeção de Demandas (RCs) em Tempo Real:** Disparo imediato de requisições de Matéria-Prima (PCP) e Indiretos (MRO) na tela dos alunos.
* **Mercado de Câmbio:** Gestão de cotações USD/EUR.
* **Rubrica Oficial de Avaliação:** Acompanhamento do desempenho técnico e socioemocional da turma.

---

## 🛠️ Tecnologias
* **Frontend:** React 19, Vite 6, Tailwind CSS 4
* **Ícones:** Lucide React
* **Gráficos:** SVG Dinâmico Nativo
* **Distribuição Standalone:** `simulador.html` (executável diretamente em qualquer navegador sem dependências).

---

## 🚀 Como Executar

### Opção 1: Aplicação React / Vite
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

### Opção 2: Simulador Standalone Direto
Basta abrir o arquivo `simulador.html` diretamente em qualquer navegador web moderno.
