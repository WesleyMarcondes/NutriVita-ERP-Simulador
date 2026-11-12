import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calculator, Globe, Mail, ShoppingCart, Truck, FileText, 
  CheckCircle, XCircle, Info, Send, ArrowRight, Search, Building2, Package, 
  ShieldCheck, AlertTriangle, Clock, BookOpen, Plus
} from 'lucide-react';

// DADOS INSTITUCIONAIS E CONSTANTES
const TAB_NAMES = [
  "0. Dossiê Inicial",
  "1. Dashboard & RCs",
  "2. Calculadora MRP",
  "3. Homologação & IQF",
  "4. Webmail Corporativo",
  "5. Emissão de Pedidos (PO)",
  "6. Torre de Follow-up"
];

const INITIAL_RCS = [
  { id: 'RC-101', dept: 'Produção / PCP', item: 'Massa de Cacau Fina 100%', itemType: 'cacau', qty: '1.000 kg', urgency: 'Alta', status: 'Pendente', date: 'Hoje, 08:30' },
  { id: 'RC-102', dept: 'Logística / Almoxarifado', item: 'Filme Stretch Automático 500mm', itemType: 'filme', qty: '80 bobinas', urgency: 'Média', status: 'Pendente', date: 'Hoje, 09:15' }
];

const KPI_HELP = {
  budget: {
    title: 'Orçamento Disponível (Budget de Compras)',
    desc: 'Representa o teto financeiro autorizado pela diretoria executiva para aquisição de matérias-primas e suprimentos no ciclo corrente. Toda ordem de compra (PO) emitida abate seu valor total diretamente desta cota de capital de giro.'
  },
  saving: {
    title: 'Saving Acumulado (Economia Gerada)',
    desc: 'Indicador estratégico de performance de suprimentos. Mede a diferença financeira positiva conquistada pelo analista entre a cotação inicial de referência (baseline) e o valor final homologado após rodadas de contraproposta no Webmail.'
  },
  serviceLevel: {
    title: 'Nível de Serviço (OTIF - On-Time In-Full)',
    desc: 'Métrica de excelência logística que avalia o percentual de pedidos entregues rigorosamente dentro da janela acordada e em conformidade estrita com o laudo de Controle de Qualidade (CQ). Meta de classe mundial: >= 95%.'
  },
  occupation: {
    title: 'Taxa de Ocupação do Armazém Fabril',
    desc: 'Espelho volumétrico físico da planta de Extrema/MG. É atualizado organicamente de forma automatizada apenas quando as cargas são liberadas da doca de descarga e Controle de Qualidade para guarda física nas posições porta-paletes (+12% por lote de matéria-prima).'
  }
};

const MRP_CONTEXTS = {
  cacau: {
    title: 'Diretrizes da Linha: RC-101 • Massa de Cacau Fina 100% (PCP)',
    desc: 'O departamento de Planejamento e Controle da Produção (PCP) solicita o lote para barras proteicas com os seguintes parâmetros diários:',
    unit: 'kg',
    cmRef: '100 kg / dia',
    ltRef: '5 dias úteis',
    recom: [
      'Para resguardar a fábrica contra oscilações de consumo ou atrasos no transporte, o Estoque Mínimo de Segurança (EMin) recomendado equivale à cobertura de 2 dias de produção.',
      'Para obter condições comerciais favoráveis e otimizar custos de frete, o Lote de Reposição (Q) padrão negociado equivale à cobertura de 10 dias de produção.'
    ],
    expected: { cm: 100, lt: 5, emin: 200, lote: 1000 }
  },
  filme: {
    title: 'Diretrizes do Almoxarifado: RC-102 • Filme Stretch Automático (MRO)',
    desc: 'O setor de paletização e embalagem informa o consumo diário de bobinas de filme stretch para fechar paletes de expedição:',
    unit: 'bobinas',
    cmRef: '8 bobinas / dia',
    ltRef: '2 dias úteis',
    recom: [
      'Para evitar a paralisação do setor de expedição por falta de insumos de paletização, o Estoque Mínimo de Segurança (EMin) recomendado equivale à cobertura de 3 dias de consumo.',
      'O pedido de reposição deve ser dimensionado para um Lote de Compra (Q) com cobertura de 10 dias de consumo.'
    ],
    expected: { cm: 8, lt: 2, emin: 24, lote: 80 }
  }
};

const SUPPLIER_DOSSIERS = {
  cacau: {
    title: 'Dossiê Legal: Cacau Global Corp (Gana / Internacional)',
    content: (
      <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
        <p><strong>Razão Social:</strong> Cacau Global Export Corp Ltd.</p>
        <p><strong>Origem:</strong> Porto de Tema, Gana (Internacional).</p>
        <p><strong>Situação Fiscal:</strong> Regular / Registrada na Câmara de Comércio de Gana e Receita Federal (RADAR ativo).</p>
        <p><strong>Alvará Sanitário:</strong> Certificado Fitossanitário Internacional emitido pelo Ministério da Agricultura de Gana.</p>
        <p><strong>Certificações de Qualidade:</strong> Possui Certificação ISO 22000 e FSSC 22000 vigentes.</p>
        <p><strong>Capacidade Financeira:</strong> Patrimônio Líquido US$ 12M com capacidade de fornecimento comprovada.</p>
      </div>
    )
  },
  vale: {
    title: 'Dossiê Legal: Vale Lácteos S/A (Minas Gerais / Brasil)',
    content: (
      <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
        <p><strong>Razão Social:</strong> Laticínios Vale Lácteos S/A.</p>
        <p><strong>Origem:</strong> Pouso Alegre / MG (Nacional).</p>
        <p><strong>Situação Fiscal:</strong> CND Regular na Receita Federal e SEF/MG.</p>
        <p><strong>Licença Sanitária:</strong> Possui SIF (Serviço de Inspeção Federal) ativo sob número #3821.</p>
        <p><strong>Certificações de Qualidade:</strong> Possui Boas Práticas de Fabricação (BPF), porém <span className="underline font-bold text-red-600">NÃO possui certificação ISO 22000</span> (auditoria ainda em processo de implantação).</p>
        <p><strong>Capacidade Financeira:</strong> Balanço aprovado com liquidez corrente de 1.4.</p>
      </div>
    )
  },
  polipack: {
    title: 'Dossiê Legal: Polipack Embalagens (Brasil)',
    content: (
      <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
        <p><strong>Razão Social:</strong> Polipack Indústria Plástica Ltda.</p>
        <p><strong>Origem:</strong> Campinas / SP (Nacional).</p>
        <p><strong>Situação Fiscal:</strong> CND Regular na Receita Federal.</p>
        <p><strong>Alvará:</strong> Licença Ambiental da CETESB e Alvará de Funcionamento vigentes.</p>
        <p><strong>Certificações de Qualidade:</strong> Possui ISO 9001 (Gestão da Qualidade geral), porém <span className="underline font-bold text-red-600">NÃO possui ISO 22000</span>.</p>
        <p><strong>Capacidade Financeira:</strong> Capital social integralizado de R$ 5M.</p>
      </div>
    )
  }
};

const SUPPLIER_CATALOGS = {
  'Cacau Global Corp': [
    { sku: 'CAC-01', name: 'Cacau em Pó Alcalino 100%', price: 18.50, moq: 500 },
    { sku: 'CAC-02', name: 'Manteiga de Cacau Desodorizada', price: 24.00, moq: 400 },
    { sku: 'CAC-03', name: 'Massa de Cacau Fina 100%', price: 21.42, moq: 1000 },
    { sku: 'CAC-04', name: 'Nibs de Cacau Orgânicos', price: 26.80, moq: 300 }
  ],
  'Vale Lácteos S/A': [
    { sku: 'LAC-01', name: 'Caseinato de Cálcio 90%', price: 34.00, moq: 300 },
    { sku: 'LAC-02', name: 'Leite em Pó Desnatado', price: 16.50, moq: 500 },
    { sku: 'LAC-03', name: 'Soro de Leite em Pó Concentrado', price: 19.80, moq: 400 },
    { sku: 'LAC-04', name: 'Whey Protein Concentrado 80%', price: 29.50, moq: 800 }
  ],
  'Polipack Embalagens': [
    { sku: 'EMB-01', name: 'Filme Stretch Automático 500mm', price: 42.00, moq: 50 },
    { sku: 'EMB-02', name: 'Filme Stretch Manual 25 micras', price: 38.00, moq: 40 },
    { sku: 'EMB-03', name: 'Fita Adesiva Acrílica Transparente', price: 6.50, moq: 200 },
    { sku: 'EMB-04', name: 'Fita de Arquear Poliéster 16mm', price: 85.00, moq: 20 }
  ]
};

export default function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);
  const [activeKpiModal, setActiveKpiModal] = useState(null);
  const [showIncotermsModal, setShowIncotermsModal] = useState(false);
  const [showPoSuccessModal, setShowPoSuccessModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(null);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);

  // KPIs
  const [kpis, setKpis] = useState({
    budget: 150000,
    saving: 14500,
    serviceLevel: 98,
    occupation: 45
  });

  // Trilha de Aprendizagem
  const [trailStage, setTrailStage] = useState(1);
  const [trailText, setTrailText] = useState("Estágio 1 de 6 (Dossiê Lido & Dashboard Ativo)");
  const [trailProgress, setTrailProgress] = useState(16);

  // RCs
  const [requisitions, setRequisitions] = useState(INITIAL_RCS);
  const [selectedRcId, setSelectedRcId] = useState('RC-101');

  // MRP State
  const activeRc = requisitions.find(r => r.id === selectedRcId) || requisitions[0];
  const activeMrpCtx = MRP_CONTEXTS[activeRc.itemType] || MRP_CONTEXTS.cacau;
  const [mrpInputs, setMrpInputs] = useState({ cm: '', lt: '', emin: '', lote: '' });
  const [isMrpValidated, setIsMrpValidated] = useState(false);
  const [mrpValidationMsg, setMrpValidationMsg] = useState('');

  // Homologação de Fornecedores
  const [suppliers, setSuppliers] = useState([
    { id: 'cacau', name: 'Cacau Global Corp', origin: 'Gana (Internacional)', raw: 'Massa de Cacau 100%', iqf: 100, status: 'Homologado' },
    { id: 'vale', name: 'Vale Lácteos S/A', origin: 'Minas Gerais (Brasil)', raw: 'Whey Protein Concentrado 80%', iqf: 0, status: 'Auditoria Pendente' },
    { id: 'polipack', name: 'Polipack Embalagens', origin: 'São Paulo (Brasil)', raw: 'Filme Stretch 500mm MRO', iqf: 75, status: 'Homologado' }
  ]);
  const [auditChecks, setAuditChecks] = useState({ alvara: false, cnd: false, haccp: false, fin: false });
  const [newSupplierForm, setNewSupplierForm] = useState({ name: '', origin: 'Nacional', raw: 'Matéria-Prima' });

  // Webmail Corporativo
  const [emails, setEmails] = useState([
    {
      id: 1,
      from: "Jean-Paul Mensah <comercial@cacauglobal.com>",
      subject: "Proposta Comercial: Massa de Cacau Fina",
      showRcBtn: false,
      unread: false,
      history: [],
      body: `Prezado Analista Wesley Marcondes,\n\nInformamos nossa cotação oficial para o lote de 1.000 kg de Massa de Cacau Fina 100%:\n- Preço Unitário Base: US$ 4.20/kg\n- Modal: Marítimo com Incoterm FOB Porto de Tema (Gana)\n- Lead Time estimado: 5 dias úteis até o desembarque em Santos\n- Condição de pagamento: 30 dias DDL\n\nCaso deseje negociar a alteração do Incoterm para CIF ou desconto para fechamento imediato do pedido, favor responder este e-mail.\n\nAtenciosamente,\nJean-Paul Mensah\nGerente de Contas Internacionais | Cacau Global Export Corp`
    },
    {
      id: 2,
      from: "Roberto Lima <roberto.pcp@nutrivitafoods.com.br>",
      subject: "URGENTE: Solicitação de Compra de Cacau em Pó",
      showRcBtn: true,
      unread: false,
      history: [],
      body: `Prezado Wesley (Suprimentos),\n\nA linha de produção de achocolatados e barras proteicas teve um aumento de demanda de 25% para a campanha de fim de ano. Nosso estoque de segurança cobrirá apenas mais 4 dias úteis.\n\nSolicito a emissão de uma Requisição de Compra (RC) emergencial de 2.500 kg de Cacau em Pó Alcalino 100% para não pararmos os turnos da próxima semana.\n\nFavor formalizar a RC no sistema assim que possível.\n\nAtenciosamente,\nRoberto Lima\nCoordenador de PCP | NutriVita Foods S/A`
    },
    {
      id: 3,
      from: "Carlos Andrade <almoxarifado@nutrivitafoods.com.br>",
      subject: "Estoque de Filme Stretch Crítico",
      showRcBtn: false,
      unread: false,
      history: [],
      body: `Olá Compras,\n\nConstatamos em inventário rotativo que restam somente 12 bobinas de filme stretch automático no setor de paletização.\nFavor providenciar a emissão de PO complementar com a Polipack para evitarmos gargalos na expedição.\n\nAtenciosamente,\nCarlos Andrade\nLíder de Almoxarifado Central | NutriVita Foods`
    }
  ]);
  const [selectedMailId, setSelectedMailId] = useState(1);
  const [mailReplyInput, setMailReplyInput] = useState('');
  const [webmailCountdown, setWebmailCountdown] = useState(null);
  const [hasWebmailBadge, setHasWebmailBadge] = useState(false);

  // PO Form
  const [poSupplier, setPoSupplier] = useState('Cacau Global Corp');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedSku, setSelectedSku] = useState(SUPPLIER_CATALOGS['Cacau Global Corp'][2]);
  const [poQty, setPoQty] = useState(1000);
  const [poModal, setPoModal] = useState('Marítimo');
  const [poIncoterm, setPoIncoterm] = useState('FOB');

  // Follow-up & Inbound Transit
  const [inboundStage, setInboundStage] = useState(1); // 1 a 5
  const [inboundSecondsLeft, setInboundSecondsLeft] = useState(35);
  const [isAutoTransitActive, setIsAutoTransitActive] = useState(true);
  const [hasFollowupBadge, setHasFollowupBadge] = useState(false);
  const [followupNotes, setFollowupNotes] = useState([
    `[Hoje, 10:50] Pedido PO #2026-0042 emitido e transmitido eletronicamente via Webmail ao exportador.`
  ]);

  // Toast
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
  };

  // CÁLCULOS MRP REATIVOS
  const cmNum = Number(mrpInputs.cm) || 0;
  const ltNum = Number(mrpInputs.lt) || 0;
  const eminNum = Number(mrpInputs.emin) || 0;
  const loteNum = Number(mrpInputs.lote) || 0;
  const ppCalculated = (cmNum * ltNum) + eminNum;
  const emaxCalculated = eminNum + loteNum;

  // CÁLCULOS DE FRETE E PO
  let freightPerUnit = 0;
  let insurancePerUnit = 0;
  let etaDays = "5 dias úteis";

  if (poModal === 'Marítimo') {
    freightPerUnit = (poIncoterm === 'CIF' || poIncoterm === 'DDP') ? 0 : 3.80;
    insurancePerUnit = (poIncoterm === 'CIF' || poIncoterm === 'DDP') ? 0 : 0.90;
    etaDays = "5 a 7 dias úteis";
  } else if (poModal === 'Rodoviário') {
    freightPerUnit = (poIncoterm === 'CIF' || poIncoterm === 'DDP') ? 0 : 1.80;
    insurancePerUnit = 0.30;
    etaDays = "2 a 3 dias úteis";
  } else if (poModal === 'Aéreo') {
    freightPerUnit = (poIncoterm === 'CIF' || poIncoterm === 'DDP') ? 0 : 12.50;
    insurancePerUnit = 1.90;
    etaDays = "1 a 2 dias úteis (Expresso)";
  }

  const poUnitPrice = selectedSku?.price || 21.42;
  const poTotalOrder = (poUnitPrice * poQty) + ((freightPerUnit + insurancePerUnit) * poQty);

  // TICKER WEBMAIL PERSISTENTE EM SEGUNDO PLANO
  useEffect(() => {
    if (webmailCountdown === null) return;
    if (webmailCountdown <= 0) {
      // Conclui resposta da IA
      let supplierName = "Jean-Paul Mensah (Cacau Global)";
      let responseText = "Prezado Wesley,\n\nAgradecemos sua contraproposta técnica. Aceitamos conceder 3.5% de desconto no lote ou assumir parte das taxas portuárias. O prazo de entrega de 5 dias úteis permanece garantido após a emissão da PO oficial.\n\nAtenciosamente,\nJean-Paul Mensah";
      let savingIncrement = 1200;

      if (selectedMailId === 2) {
        supplierName = "Roberto Lima (PCP)";
        responseText = "Wesley, obrigado pelo retorno imediato! O alinhamento dos prazos salvou o planejamento do turno.\n\nAtenciosamente,\nRoberto Lima";
        savingIncrement = 0;
      } else if (selectedMailId === 3) {
        supplierName = "Carlos Andrade (Almoxarifado)";
        responseText = "Confirmado! O setor de embalagens já iniciou a separação preventiva do lote.\n\nAtenciosamente,\nCarlos Andrade";
        savingIncrement = 0;
      }

      setEmails(prev => prev.map(em => {
        if (em.id === selectedMailId) {
          return {
            ...em,
            history: [
              ...em.history,
              {
                type: 'received',
                sender: supplierName,
                time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                text: responseText
              }
            ]
          };
        }
        return em;
      }));

      if (savingIncrement > 0) {
        setKpis(prev => ({ ...prev, saving: prev.saving + savingIncrement }));
      }

      if (currentTab !== 4) {
        showToast(`📧 Nova resposta recebida de ${supplierName}!`);
        setHasWebmailBadge(true);
      }

      setWebmailCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setWebmailCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [webmailCountdown, selectedMailId, currentTab]);

  // CRONÔMETRO INBOUND DE TRÂNSITO EM SEGUNDO PLANO
  useEffect(() => {
    if (!isAutoTransitActive || inboundStage >= 5) return;

    if (inboundSecondsLeft <= 0) {
      setInboundSecondsLeft(35);
      advanceKanbanMilestone();
      return;
    }

    const timer = setTimeout(() => {
      setInboundSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [inboundSecondsLeft, isAutoTransitActive, inboundStage]);

  const advanceKanbanMilestone = () => {
    if (inboundStage >= 5) return;

    const nextStage = inboundStage + 1;
    setInboundStage(nextStage);

    const stageLabels = [
      "",
      "Marco 1: Despachado Origem",
      "Marco 2: Em Trânsito Marítimo",
      "Marco 3: Portaria / Descarga",
      "Marco 4: Laudo de CQ",
      "Marco 5: Guardado no Estoque ✓"
    ];

    const stageDesc = [
      "",
      "Carga despachada no porto de Tema.",
      "Navio em alto-mar navegando rumo ao Porto de Santos.",
      "Caminhão atracou na portaria de Extrema/MG para descarga.",
      "Amostras coletadas pelo laboratório de Controle de Qualidade (CQ).",
      "Laudo de CQ APROVADO! Lote guardado no armazém da fábrica."
    ];

    const note = `[Hoje, ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}] ${stageLabels[nextStage]}: ${stageDesc[nextStage]}`;
    setFollowupNotes(prev => [...prev, note]);

    showToast(`Pedido PO #2026-0042 avançou: ${stageLabels[nextStage]}!`);

    if (currentTab !== 6) {
      setHasFollowupBadge(true);
    }

    if (nextStage === 5) {
      setKpis(prev => ({ ...prev, occupation: Math.min(100, prev.occupation + 12) }));
      setRequisitions(prev => prev.map(r => r.itemType === 'cacau' ? { ...r, status: 'Atendido / Concluído ✓' } : r));
      setTrailText("Estágio 6 de 6 Concluído (Mercadoria em Estoque!)");
      setTrailProgress(100);
    }
  };

  const handleSwitchTab = (idx) => {
    setCurrentTab(idx);
    if (idx === 4) setHasWebmailBadge(false);
    if (idx === 6) setHasFollowupBadge(false);
  };

  // SELEÇÃO DE RC PARA MRP
  const handleSelectRcForMrp = (rc) => {
    setSelectedRcId(rc.id);
    if (rc.status === 'Pendente') {
      setRequisitions(prev => prev.map(r => r.id === rc.id ? { ...r, status: 'Em Análise no MRP' } : r));
    }
    setMrpInputs({ cm: '', lt: '', emin: '', lote: '' });
    setIsMrpValidated(false);
    setMrpValidationMsg('');
    setCurrentTab(2);
  };

  // VALIDAÇÃO MRP COM TRAVA TÉCNICA
  const handleValidateMrp = () => {
    const exp = activeMrpCtx.expected;
    if (cmNum === exp.cm && ltNum === exp.lt && eminNum === exp.emin && loteNum === exp.lote) {
      setIsMrpValidated(true);
      setMrpValidationMsg('✓ Dimensionamento validado com sucesso conforme as diretrizes corporativas!');
      setTrailStage(2);
      setTrailText("Estágio 2 de 6 Concluído (MRP Validado)");
      setTrailProgress(33);
    } else {
      setIsMrpValidated(false);
      setMrpValidationMsg('⚠️ Os parâmetros preenchidos divergem das recomendações da linha. Revise a cobertura e tente novamente.');
    }
  };

  // AUDITORIA IQF COM TRAVA ANTI-FRAUDE
  const handleSaveAudit = () => {
    if ((showAuditModal === 'vale' || showAuditModal === 'polipack') && auditChecks.haccp) {
      alert('⚠️ INCONSISTÊNCIA DOCUMENTAL DETECTADA!\n\nVocê assinalou que a empresa possui certificação ISO 22000 / HACCP. Contudo, o Dossiê Legal expressa com clareza que o fornecedor NÃO concluiu a auditoria da referida norma.\n\nPor favor, desmarque o item e proceda com rigor técnico.');
      return;
    }

    const checksCount = Object.values(auditChecks).filter(Boolean).length;
    const score = checksCount * 25;

    setSuppliers(prev => prev.map(s => {
      if (s.id === showAuditModal) {
        return {
          ...s,
          iqf: score,
          status: score >= 75 ? 'Homologado com Ressalva' : 'Reprovado (IQF < 75)'
        };
      }
      return s;
    }));

    setShowAuditModal(null);
    alert(`Auditoria concluída com sucesso! Nota IQF registrada: ${score}/100.`);
  };

  // ENVIO DE RESPOSTA NO WEBMAIL
  const handleSendMailReply = (e) => {
    e.preventDefault();
    if (!mailReplyInput.trim()) return;

    const newReply = {
      type: 'sent',
      sender: 'Wesley Marcondes (NutriVita Compras)',
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      text: mailReplyInput.trim()
    };

    setEmails(prev => prev.map(em => em.id === selectedMailId ? { ...em, history: [...em.history, newReply] } : em));
    setMailReplyInput('');

    setTrailStage(4);
    setTrailText("Estágio 4 de 6 Concluído (Negociação no Webmail Realizada)");
    setTrailProgress(66);

    const waitSeconds = Math.floor(Math.random() * 8) + 8; // 8s a 15s
    setWebmailCountdown(waitSeconds);
  };

  // EMISSÃO DE PO
  const handleEmitPo = (e) => {
    e.preventDefault();
    setKpis(prev => ({ ...prev, budget: Math.max(0, prev.budget - poTotalOrder) }));
    setRequisitions(prev => prev.map(r => r.id === selectedRcId ? { ...r, status: 'PO-2026-0042 Emitida' } : r));
    setTrailStage(5);
    setTrailText("Estágio 5 de 6 Concluído (PO Emitida)");
    setTrailProgress(83);
    setShowPoSuccessModal(true);
  };

  const pendingRcsCount = requisitions.filter(r => r.status === 'Pendente' || r.status.includes('Análise')).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      
      {/* TOAST DE NOTIFICAÇÃO FLUTUANTE */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-emerald-500 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 font-bold">
            <Truck size={18} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">Atualização Logística</span>
            <p className="text-sm font-medium">{toastMsg}</p>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-3 text-slate-400 hover:text-white font-bold text-xs bg-slate-800 p-1.5 rounded">✕</button>
        </div>
      )}

      {/* HEADER INSTITUCIONAL COM USUÁRIO PERSONALIZADO */}
      <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-xs shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-lg shadow-sm">N</div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">NutriVita Foods ERP</h1>
            <p className="text-xs text-emerald-700 font-semibold">Simulador de Suprimentos & Logística Integrada</p>
          </div>
        </div>

        {/* Indicador Orgânico do Módulo / Tab Ativa */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-xs shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-500 font-medium">Módulo Atual:</span>
          <strong className="text-slate-800 font-bold">{TAB_NAMES[currentTab]}</strong>
        </div>

        {/* Perfil do Usuário / Analista */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="font-bold text-slate-800 text-xs block">Wesley Marcondes</span>
            <span className="text-xs text-slate-500">Analista de Suprimentos Pleno • Matrícula #4829</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold flex items-center justify-center text-xs">
            WM
          </div>
          <button 
            onClick={() => setIsMissionControlOpen(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Clock size={16} className="text-emerald-400" />
            Mission Control
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR DE NAVEGAÇÃO */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Módulos da Simulação</span>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-sm">
            <button 
              onClick={() => handleSwitchTab(0)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${currentTab === 0 ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
            >
              <BookOpen size={16} className={currentTab === 0 ? 'text-emerald-700' : 'text-slate-500'} />
              0. Dossiê Inicial
            </button>

            <button 
              onClick={() => handleSwitchTab(1)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition ${currentTab === 1 ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={16} className={currentTab === 1 ? 'text-emerald-700' : 'text-slate-500'} />
                <span>1. Dashboard & RCs</span>
              </div>
              {pendingRcsCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">{pendingRcsCount}</span>
              )}
            </button>

            <button 
              onClick={() => handleSwitchTab(2)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${currentTab === 2 ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
            >
              <Calculator size={16} className={currentTab === 2 ? 'text-emerald-700' : 'text-slate-500'} />
              2. Calculadora MRP
            </button>

            <button 
              onClick={() => handleSwitchTab(3)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${currentTab === 3 ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
            >
              <Globe size={16} className={currentTab === 3 ? 'text-emerald-700' : 'text-slate-500'} />
              3. Homologação & IQF
            </button>

            <button 
              onClick={() => handleSwitchTab(4)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition relative ${currentTab === 4 ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
            >
              <div className="flex items-center gap-3">
                <Mail size={16} className={currentTab === 4 ? 'text-emerald-700' : 'text-slate-500'} />
                <span>4. Webmail Corporativo</span>
              </div>
              {hasWebmailBadge && (
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
              )}
            </button>

            <button 
              onClick={() => handleSwitchTab(5)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${currentTab === 5 ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
            >
              <ShoppingCart size={16} className={currentTab === 5 ? 'text-emerald-700' : 'text-slate-500'} />
              5. Emissão de Pedidos (PO)
            </button>

            <button 
              onClick={() => handleSwitchTab(6)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition relative ${currentTab === 6 ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
            >
              <div className="flex items-center gap-3">
                <Truck size={16} className={currentTab === 6 ? 'text-emerald-700' : 'text-slate-500'} />
                <span>6. Torre de Follow-up</span>
              </div>
              {hasFollowupBadge && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </button>
          </nav>

          <div className="p-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
            Fábrica Extrema / MG
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">

          {/* TAB 0: DOSSIÊ E ONBOARDING */}
          {currentTab === 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-7 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="px-2.5 py-1 bg-white/20 text-emerald-200 text-xs font-bold rounded-md uppercase tracking-wider">Dossiê Corporativo & Onboarding</span>
                  <h2 className="text-2xl font-black">NutriVita Foods S/A - Indústria de Alimentos</h2>
                  <p className="text-sm text-emerald-100 leading-relaxed">
                    Bem-vindo ao departamento de Suprimentos & Planejamento Logístico da fábrica de Extrema/MG. Como analista responsável, sua missão é assegurar o abastecimento ininterrupto das linhas produtivas, garantindo os melhores custos (Saving) e máxima conformidade técnica.
                  </p>
                </div>
                <button 
                  onClick={() => handleSwitchTab(1)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition shadow-lg shrink-0 flex items-center gap-2"
                >
                  Iniciar Turno Operacional →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                    <ShieldCheck size={18} /> Metas do Trimestre
                  </div>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li className="flex justify-between border-b pb-1.5"><span>Saving Mínimo:</span> <strong className="text-emerald-700">R$ 15.000</strong></li>
                    <li className="flex justify-between border-b pb-1.5"><span>Nível de Serviço (OTIF):</span> <strong className="text-purple-700">&ge; 95%</strong></li>
                    <li className="flex justify-between border-b pb-1.5"><span>Teto Ocupação Armazém:</span> <strong className="text-amber-700">80%</strong></li>
                    <li className="flex justify-between"><span>Budget Total Aprovado:</span> <strong className="text-slate-900">R$ 150.000</strong></li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <BookOpen size={18} /> Políticas de Compras (SOP)
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    1. Todo fornecedor para matérias-primas críticas exige nota <strong>IQF &ge; 75</strong>.<br />
                    2. Compras internacionais com pagamento antecipado exigem cotação de seguro.<br />
                    3. O Ponto de Pedido no MRP deve obedecer rigorosamente às Recomendações da Linha.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                    <Compass size={18} /> Ciclo Operacional do Aluno
                  </div>
                  <div className="text-xs text-slate-700 space-y-1.5">
                    <div className="p-2 bg-slate-50 rounded border">1. Analisar Demanda no Dashboard</div>
                    <div className="p-2 bg-slate-50 rounded border">2. Dimensionar Necessidade no MRP</div>
                    <div className="p-2 bg-slate-50 rounded border">3. Homologar & Negociar no Webmail</div>
                    <div className="p-2 bg-slate-50 rounded border">4. Emitir Pedido de Compra (PO)</div>
                    <div className="p-2 bg-slate-50 rounded border">5. Monitorar na Torre de Follow-up</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD & REQUISIÇÕES */}
          {currentTab === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Painel do Analista de Suprimentos</h2>
                <p className="text-sm text-slate-500">Monitore KPIs corporativos e processe as Requisições de Compras (RCs) pendentes.</p>
              </div>

              {/* KPIs com Modais de Letramento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 relative shadow-sm">
                  <button onClick={() => setActiveKpiModal('budget')} className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600 transition" title="Letramento Técnico">
                    <Info size={18} />
                  </button>
                  <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Orçamento Disponível</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">R$ {kpis.budget.toLocaleString('pt-BR')}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 relative shadow-sm">
                  <button onClick={() => setActiveKpiModal('saving')} className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600 transition" title="Letramento Técnico">
                    <Info size={18} />
                  </button>
                  <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Saving Obtido</p>
                  <p className="text-2xl font-black text-blue-700 mt-1">R$ {kpis.saving.toLocaleString('pt-BR')}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 relative shadow-sm">
                  <button onClick={() => setActiveKpiModal('serviceLevel')} className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600 transition" title="Letramento Técnico">
                    <Info size={18} />
                  </button>
                  <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nível de Serviço (OTIF)</p>
                  <p className="text-2xl font-black text-purple-700 mt-1">{kpis.serviceLevel}%</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 relative shadow-sm">
                  <button onClick={() => setActiveKpiModal('occupation')} className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600 transition" title="Letramento Técnico">
                    <Info size={18} />
                  </button>
                  <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ocupação do Armazém</p>
                  <p className="text-2xl font-black text-amber-700 mt-1">{kpis.occupation}%</p>
                </div>
              </div>

              {/* Trilha Pedagógica Integrada */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Compass size={16} className="text-emerald-600" /> Trilha de Aprendizagem do Ciclo de Compras
                  </span>
                  <span className="text-emerald-700">{trailText}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full transition-all duration-500 rounded-full" style={{ width: `${trailProgress}%` }}></div>
                </div>
              </div>

              {/* Caixa de Entrada de RCs */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">Caixa de Entrada de Requisições de Compras (RCs)</h3>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">{pendingRcsCount} pendentes</span>
                  </div>
                  <span className="text-xs text-slate-500">Clique para iniciar o dimensionamento técnico no MRP</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {requisitions.map(rc => (
                    <div key={rc.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{rc.id} • {rc.item}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{rc.dept}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${rc.urgency === 'Alta' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{rc.urgency}</span>
                        </div>
                        <p className="text-xs text-slate-500">Lote Solicitado: <strong>{rc.qty}</strong> • Entrada: {rc.date}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${rc.status.includes('Concluído') ? 'bg-emerald-100 text-emerald-800' : (rc.status.includes('PO') ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')}`}>
                          {rc.status}
                        </span>
                        {rc.status !== 'Atendido / Concluído ✓' ? (
                          <button 
                            onClick={() => handleSelectRcForMrp(rc)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1"
                          >
                            Calcular MRP <ArrowRight size={14} />
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-700 font-bold px-3 py-1 bg-emerald-50 rounded border border-emerald-200">
                            Estoque Abastecido ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALCULADORA MRP COM RECOMENDAÇÕES CONCEITUAIS */}
          {currentTab === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Planejamento de Materiais (MRP)</h2>
                <p className="text-sm text-slate-500">Dimensione o Ponto de Pedido e Estoque Máximo baseado nas diretrizes oficiais da fábrica.</p>
              </div>

              {/* Card de Diretrizes da Linha Selecionada */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-blue-950 text-sm">{activeMrpCtx.title}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-200/70 text-blue-900">Unidade: {activeMrpCtx.unit}</span>
                </div>
                <p className="text-xs text-blue-900">{activeMrpCtx.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-blue-200 flex justify-between items-center shadow-xs">
                    <div>
                      <span className="text-slate-600 block font-medium">Consumo Médio da Linha:</span>
                      <span className="text-xs text-slate-400">Demanda contínua para produção</span>
                    </div>
                    <strong className="text-blue-800 text-base">{activeMrpCtx.cmRef}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200 flex justify-between items-center shadow-xs">
                    <div>
                      <span className="text-slate-600 block font-medium">Lead Time Logístico Médio:</span>
                      <span className="text-xs text-slate-400">Tempo estimado de entrega do lote</span>
                    </div>
                    <strong className="text-blue-800 text-base">{activeMrpCtx.ltRef}</strong>
                  </div>
                </div>

                {/* Recomendações Conceituais (Sem respostas prontas) */}
                <div className="text-xs text-blue-900 bg-blue-100/70 p-3 rounded-lg border border-blue-200 leading-relaxed space-y-1">
                  <p>📘 <strong>Recomendações Técnicas da NutriVita Foods:</strong></p>
                  {activeMrpCtx.recom.map((r, i) => (
                    <p key={i}>• {r}</p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs do Aluno */}
                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-sm">Dimensionamento Técnico de Parâmetros</h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Consumo Médio Diário (CM)</label>
                    <input 
                      type="number" 
                      value={mrpInputs.cm} 
                      onChange={e => setMrpInputs({ ...mrpInputs, cm: e.target.value })} 
                      placeholder="Informe o consumo diário" 
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lead Time de Espera (LT em dias úteis)</label>
                    <input 
                      type="number" 
                      value={mrpInputs.lt} 
                      onChange={e => setMrpInputs({ ...mrpInputs, lt: e.target.value })} 
                      placeholder="Informe os dias úteis de espera" 
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estoque Mínimo / Segurança (EMin)</label>
                    <input 
                      type="number" 
                      value={mrpInputs.emin} 
                      onChange={e => setMrpInputs({ ...mrpInputs, emin: e.target.value })} 
                      placeholder="Calcule a quantidade de segurança necessária" 
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Lote Padrão de Reposição (Q)</label>
                    <input 
                      type="number" 
                      value={mrpInputs.lote} 
                      onChange={e => setMrpInputs({ ...mrpInputs, lote: e.target.value })} 
                      placeholder="Calcule o lote de reposição" 
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 text-slate-700">
                    <div className="flex justify-between items-center">
                      <span>Ponto de Pedido Calculado (PP):</span>
                      <strong className="text-emerald-700 text-sm font-black">{ppCalculated.toLocaleString('pt-BR')} {activeMrpCtx.unit}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Estoque Máximo Calculado (EMax):</span>
                      <strong className="text-blue-700 text-sm font-black">{emaxCalculated.toLocaleString('pt-BR')} {activeMrpCtx.unit}</strong>
                    </div>
                  </div>

                  <button 
                    onClick={handleValidateMrp}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CheckCircle size={16} className="text-emerald-400" /> Validar Cálculo do MRP
                  </button>
                  {mrpValidationMsg && (
                    <p className={`text-xs text-center font-bold ${isMrpValidated ? 'text-emerald-700' : 'text-red-600'}`}>{mrpValidationMsg}</p>
                  )}
                </div>

                {/* Gráfico Dente de Serra Dinâmico SVG */}
                <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Curva Visual Dente de Serra</h3>
                      <p className="text-xs text-slate-400">A curva reage dinamicamente conforme os valores informados</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded ${isMrpValidated ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {isMrpValidated ? 'Status: Validado com Sucesso ✓' : 'Status: Em dimensionamento'}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <svg viewBox="0 0 400 220" className="w-full h-auto">
                      <line x1="40" y1="20" x2="40" y2="190" stroke="#cbd5e1" strokeWidth="2"/>
                      <line x1="40" y1="190" x2="380" y2="190" stroke="#cbd5e1" strokeWidth="2"/>
                      <text x="350" y="210" fontSize="10" fill="#64748b">Tempo (dias)</text>

                      {/* Faixa EMin */}
                      <rect x="40" y="140" width="340" height="50" fill="#fee2e2" opacity="0.6"/>
                      <line x1="40" y1="140" x2="380" y2="140" stroke="#ef4444" strokeWidth="2" strokeDasharray="4"/>
                      <text x="5" y="145" fontSize="10" fill="#ef4444" fontWeight="bold">EMin: {eminNum}</text>

                      {/* Linha PP */}
                      <line x1="40" y1="95" x2="380" y2="95" stroke="#10b981" strokeWidth="2" strokeDasharray="4"/>
                      <text x="10" y="100" fontSize="10" fill="#10b981" fontWeight="bold">PP: {ppCalculated}</text>

                      {/* Linha EMax */}
                      <line x1="40" y1="35" x2="380" y2="35" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4"/>
                      <text x="5" y="40" fontSize="10" fill="#3b82f6" fontWeight="bold">EMax: {emaxCalculated}</text>

                      {/* Curva Dente de Serra */}
                      <polyline points="40,35 180,140 180,35 320,140 320,35 380,80" fill="none" stroke="#2563eb" strokeWidth="3"/>
                    </svg>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      {isMrpValidated ? '✓ Trava liberada! Você pode avançar para a homologação.' : '🔒 Preencha os valores e clique em "Validar Cálculo do MRP" para destravar a etapa.'}
                    </span>
                    <button 
                      onClick={() => handleSwitchTab(3)}
                      disabled={!isMrpValidated}
                      className={`px-4 py-2 rounded-lg font-bold transition shadow ${isMrpValidated ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      Avançar para Homologação de Fornecedor ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOMOLOGAÇÃO & IQF */}
          {currentTab === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Homologação & Auditoria de IQF</h2>
                  <p className="text-sm text-slate-500">Selecione um fornecedor homologado para negociar no Webmail ou cadastre e audite novos parceiros.</p>
                </div>
                <button 
                  onClick={() => setShowNewSupplierModal(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-xs"
                >
                  <Plus size={16} /> + Cadastrar Novo Fornecedor
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Fornecedor</th>
                      <th className="px-5 py-3.5">Origem</th>
                      <th className="px-5 py-3.5">Insumo Cadastrado</th>
                      <th className="px-5 py-3.5">IQF</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Ações Pedagógicas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {suppliers.map(sup => (
                      <tr key={sup.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-4 font-semibold text-slate-900">{sup.name}</td>
                        <td className="px-5 py-4 text-xs text-slate-600">{sup.origin}</td>
                        <td className="px-5 py-4 text-xs font-medium">{sup.raw}</td>
                        <td className={`px-5 py-4 font-bold ${sup.iqf >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>{sup.iqf} / 100</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sup.status.includes('Homologado') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {sup.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button 
                            onClick={() => setShowDossierModal(sup.id)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3 py-1.5 rounded transition"
                          >
                            Ler Dossiê
                          </button>
                          {sup.iqf >= 75 ? (
                            <button 
                              onClick={() => {
                                setTrailStage(3);
                                setTrailText("Estágio 3 de 6 Concluído (Fornecedor Homologado)");
                                setTrailProgress(50);
                                handleSwitchTab(4);
                              }}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-xs"
                            >
                              Selecionar e Negociar no Webmail →
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setAuditChecks({ alvara: false, cnd: false, haccp: false, fin: false });
                                setShowAuditModal(sup.id);
                              }}
                              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-xs"
                            >
                              Auditar IQF
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: WEBMAIL CORPORATIVO */}
          {currentTab === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Webmail Corporativo de Suprimentos</h2>
                  <p className="text-sm text-slate-500">Negocie termos comerciais, Inconterms e alinhe prazos diretamente com fornecedores e demandantes.</p>
                </div>
                <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-3 py-1 rounded-full">
                  Conectado • servidor: mail.nutrivitafoods.com.br
                </span>
              </div>

              <div className="grid grid-cols-12 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[560px]">
                {/* Lista de E-mails */}
                <div className="col-span-12 md:col-span-4 border-r border-slate-200 bg-slate-50 flex flex-col">
                  <div className="p-3.5 border-b border-slate-200 bg-white flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">Caixa de Entrada</span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{emails.length} mensagens</span>
                  </div>
                  <div className="divide-y divide-slate-200 overflow-y-auto">
                    {emails.map(mail => (
                      <div 
                        key={mail.id} 
                        onClick={() => setSelectedMailId(mail.id)}
                        className={`p-3.5 cursor-pointer transition ${selectedMailId === mail.id ? 'bg-emerald-50/90 border-l-4 border-emerald-600' : 'hover:bg-slate-100'}`}
                      >
                        <p className="font-bold text-xs text-slate-900 truncate">{mail.from}</p>
                        <p className="font-semibold text-xs text-slate-700 mt-0.5 truncate">{mail.subject}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{mail.body}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leitor de E-mail & Histórico de Respostas */}
                <div className="col-span-12 md:col-span-8 p-6 flex flex-col justify-between space-y-4">
                  {(() => {
                    const activeMail = emails.find(e => e.id === selectedMailId) || emails[0];
                    return (
                      <>
                        <div className="space-y-4">
                          <div className="border-b border-slate-200 pb-3">
                            <h3 className="font-bold text-lg text-slate-900">{activeMail.subject}</h3>
                            <p className="text-xs text-slate-500 mt-1">De: <strong>{activeMail.from}</strong></p>
                          </div>

                          <div className="text-sm text-slate-900 leading-relaxed whitespace-pre-line bg-white p-4 rounded-lg border border-slate-200">
                            {activeMail.body}
                          </div>

                          {/* Botão de gerar RC caso venha do PCP */}
                          {activeMail.showRcBtn && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                              <span className="text-xs text-amber-800 font-bold">Esta comunicação interna contém uma solicitação oficial de insumo fabril:</span>
                              <button 
                                onClick={() => {
                                  const newRc = {
                                    id: 'RC-103',
                                    dept: 'Produção / PCP',
                                    item: 'Cacau em Pó Alcalino 100%',
                                    itemType: 'cacau',
                                    qty: '2.500 kg',
                                    urgency: 'Crítica',
                                    status: 'Pendente',
                                    date: 'Hoje, Agora'
                                  };
                                  setRequisitions(prev => [newRc, ...prev]);
                                  alert('✓ Requisição de Compra (RC-103) gerada e inserida na Caixa de Entrada do Dashboard!');
                                  handleSwitchTab(1);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs"
                              >
                                + Gerar Requisição de Compra (RC)
                              </button>
                            </div>
                          )}

                          {/* Histórico Persistente de Negociações */}
                          <div className="space-y-3">
                            {activeMail.history.map((h, i) => (
                              <div key={i} className={`p-4 rounded-xl text-sm ${h.type === 'sent' ? 'bg-white border border-slate-200' : 'bg-white border border-emerald-200 shadow-sm'}`}>
                                <div className="flex justify-between font-bold text-xs text-slate-700 mb-2 border-b pb-1">
                                  <span>{h.sender}</span>
                                  <span className="text-slate-400">{h.time}</span>
                                </div>
                                <p className="text-slate-900 whitespace-pre-line leading-relaxed">{h.text}</p>
                              </div>
                            ))}
                          </div>

                          {/* Indicador de Digitação com Contagem Regressiva Viva */}
                          {webmailCountdown !== null && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-900">
                              <Clock size={16} className="text-blue-600 animate-spin" />
                              <span>O remetente está analisando sua proposta comercial (resposta prevista em ~<strong>{webmailCountdown}s</strong>)...</span>
                            </div>
                          )}
                        </div>

                        {/* Caixa de Redação de E-mail */}
                        <form onSubmit={handleSendMailReply} className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                          <label className="block text-xs font-bold text-slate-700">Redigir Contraproposta Técnica / Argumentação:</label>
                          <textarea 
                            rows="3" 
                            value={mailReplyInput}
                            onChange={e => setMailReplyInput(e.target.value)}
                            placeholder="Ex: Prezado Jean-Paul, solicitamos a revisão das condições de frete para CIF ou desconto de 3.5% para fechamento imediato do lote..." 
                            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">Assinatura formal anexada automaticamente.</span>
                            <button 
                              type="submit"
                              disabled={webmailCountdown !== null}
                              className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-xs flex items-center gap-2"
                            >
                              <Send size={14} /> Transmitir E-mail
                            </button>
                          </div>
                        </form>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EMISSÃO DE PEDIDOS (PO) */}
          {currentTab === 5 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Emissão de Ordem de Compra (PO)</h2>
                  <p className="text-sm text-slate-500">Formalize o pedido com o fornecedor homologado após a negociação no Webmail.</p>
                </div>
                <button 
                  onClick={() => setShowIncotermsModal(true)}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-3.5 py-2 rounded-lg border border-blue-200 flex items-center gap-1.5 shadow-xs"
                >
                  <BookOpen size={16} /> Matriz Comparativa Incoterms 2020
                </button>
              </div>

              <form onSubmit={handleEmitPo} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                {/* Card Destacado do Fornecedor */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Fornecedor Selecionado</span>
                    <select 
                      value={poSupplier}
                      onChange={e => {
                        setPoSupplier(e.target.value);
                        setSelectedSku(SUPPLIER_CATALOGS[e.target.value][0]);
                      }}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800"
                    >
                      <option value="Cacau Global Corp">Cacau Global Corp (Gana / Internacional)</option>
                      <option value="Vale Lácteos S/A">Vale Lácteos S/A (Minas Gerais / Brasil)</option>
                      <option value="Polipack Embalagens">Polipack Embalagens (São Paulo / Brasil)</option>
                    </select>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-sm text-slate-900 block">{poSupplier}</strong>
                      <span className="text-xs text-slate-500">IQF Aprovado • Regularidade Fiscal Confirmada</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">Homologado</span>
                  </div>
                </div>

                {/* Catálogo de Insumos com Busca */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-slate-700">Selecione o Insumo do Catálogo Oficial:</label>
                    <div className="relative w-48">
                      <input 
                        type="text" 
                        value={catalogSearch}
                        onChange={e => setCatalogSearch(e.target.value)}
                        placeholder="Buscar item..." 
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs pl-7"
                      />
                      <Search size={14} className="absolute left-2 top-2 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {(SUPPLIER_CATALOGS[poSupplier] || [])
                      .filter(item => item.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                      .map(item => (
                        <div 
                          key={item.sku}
                          onClick={() => setSelectedSku(item)}
                          className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${selectedSku?.sku === item.sku ? 'bg-emerald-50 border-emerald-400 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                        >
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">{item.name}</span>
                            <span className="text-[11px] text-slate-500">SKU: {item.sku} • MOQ: {item.moq} un</span>
                          </div>
                          <strong className="text-emerald-700 text-sm">R$ {item.price.toFixed(2)}</strong>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Parâmetros Logísticos & Incoterm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantidade do Pedido:</label>
                    <input 
                      type="number" 
                      value={poQty}
                      onChange={e => setPoQty(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Modal de Transporte:</label>
                    <select 
                      value={poModal}
                      onChange={e => setPoModal(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-900 font-bold"
                    >
                      <option value="Marítimo">Marítimo (Contêiner FCL)</option>
                      <option value="Rodoviário">Rodoviário (Carreta Fechada)</option>
                      <option value="Aéreo">Aéreo Expresso</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Incoterm Negociado:</label>
                    <select 
                      value={poIncoterm}
                      onChange={e => setPoIncoterm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-2 text-sm text-slate-900 font-bold"
                    >
                      <option value="FOB">FOB (Free On Board)</option>
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                      <option value="DDP">DDP (Delivered Duty Paid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prazo de Entrega Estimado:</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={etaDays}
                      className="w-full bg-slate-100 border border-slate-300 rounded p-2 text-sm text-slate-700 font-bold"
                    />
                  </div>
                </div>

                {/* Resumo Financeiro & Transmissão */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-600 block">Total da Ordem de Compra (Insumo + Frete + Seguro):</span>
                    <strong className="text-2xl font-black text-emerald-800">R$ {poTotalOrder.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <button 
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-3 rounded-lg transition shadow flex items-center gap-2"
                  >
                    Transmitir Pedido de Compra (PO)
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: TORRE DE FOLLOW-UP */}
          {currentTab === 6 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Torre de Controle Inbound & Follow-up Multi-Pedidos</h2>
                  <p className="text-sm text-slate-500">Acompanhamento de cargas em trânsito com 5 marcos operacionais e sincronização de estoque.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs flex items-center gap-2 shadow-xs">
                    <Clock size={16} className="text-blue-600 animate-spin" />
                    <span>Trânsito Orgânico: Próximo marco em <strong className="text-blue-700">{inboundStage >= 5 ? "Carga Guardada ✓" : `${inboundSecondsLeft}s`}</strong></span>
                  </div>
                </div>
              </div>

              {/* Pedido 1: Cacau Global */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">PO #2026-0042 • Cacau Global Corp</span>
                      <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-blue-100 text-blue-800">FOB Santos • Marítimo</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Item: <strong>Massa de Cacau Fina (1.000 kg)</strong> • Transportadora: TransGlobal Logistics</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full">
                      Marco {inboundStage}: {inboundStage === 1 ? 'Despachado Origem' : (inboundStage === 2 ? 'Em Trânsito' : (inboundStage === 3 ? 'Portaria / Descarga' : (inboundStage === 4 ? 'Laudo CQ' : 'Guardado no Estoque ✓')))}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">Previsão ETA: <strong>Em 5 dias úteis</strong></p>
                  </div>
                </div>

                {/* Linha do Tempo Realista de 5 Marcos */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
                  {[
                    { id: 1, title: '1. Despachado Origem' },
                    { id: 2, title: '2. Em Trânsito' },
                    { id: 3, title: '3. Portaria / Descarga' },
                    { id: 4, title: '4. Laudo de CQ' },
                    { id: 5, title: '5. Guardado no Estoque' }
                  ].map(step => (
                    <div 
                      key={step.id} 
                      className={`p-3 rounded-xl border ${step.id < inboundStage ? 'bg-emerald-50 text-emerald-800 font-bold border-emerald-200' : (step.id === inboundStage ? 'bg-emerald-100 text-emerald-900 font-bold border-2 border-emerald-500 shadow-xs' : 'bg-slate-50 text-slate-400 border-slate-200')}`}
                    >
                      {step.title}
                      <span className="text-xs block font-normal mt-0.5">
                        {step.id < inboundStage ? 'Concluído ✓' : (step.id === inboundStage ? 'Em Andamento...' : 'Pendente')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Diário de Bordo da Carga */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-700">
                    <span>Diário de Bordo da Carga (Follow-up Notes):</span>
                    <span className="text-slate-400 font-normal">Registro cronológico</span>
                  </div>
                  <div className="space-y-1">
                    {followupNotes.map((note, idx) => (
                      <p key={idx} className="p-2 bg-white rounded border border-slate-200">{note}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL DE LETRAMENTO DE KPIS */}
      {activeKpiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">{KPI_HELP[activeKpiModal].title}</h3>
              <button onClick={() => setActiveKpiModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{KPI_HELP[activeKpiModal].desc}</p>
            <button onClick={() => setActiveKpiModal(null)} className="w-full bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg">
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL DOSSIÊ DO FORNECEDOR */}
      {showDossierModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">{SUPPLIER_DOSSIERS[showDossierModal]?.title}</h3>
              <button onClick={() => setShowDossierModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              {SUPPLIER_DOSSIERS[showDossierModal]?.content}
            </div>
            <button 
              onClick={() => {
                const target = showDossierModal;
                setShowDossierModal(null);
                setAuditChecks({ alvara: false, cnd: false, haccp: false, fin: false });
                setShowAuditModal(target);
              }}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-lg transition"
            >
              Prosseguir para Auditoria Manual de IQF ➔
            </button>
          </div>
        </div>
      )}

      {/* MODAL AUDITORIA MANUAL DE IQF COM TRAVA ANTI-FRAUDE */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">Auditoria Documental de Fornecedor</h3>
                <p className="text-xs text-slate-500">Valide os critérios legais baseados no Dossiê</p>
              </div>
              <button onClick={() => setShowAuditModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input type="checkbox" checked={auditChecks.alvara} onChange={e => setAuditChecks({ ...auditChecks, alvara: e.target.checked })} />
                <span>Possui Alvará Sanitário e Licença Ambiental Vigentes (+25 pts)</span>
              </label>
              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input type="checkbox" checked={auditChecks.cnd} onChange={e => setAuditChecks({ ...auditChecks, cnd: e.target.checked })} />
                <span>Certidão Negativa de Débitos (CND) regular na Receita (+25 pts)</span>
              </label>
              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input type="checkbox" checked={auditChecks.haccp} onChange={e => setAuditChecks({ ...auditChecks, haccp: e.target.checked })} />
                <span>Certificação ISO 22000 / HACCP de Boas Práticas (+25 pts)</span>
              </label>
              <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input type="checkbox" checked={auditChecks.fin} onChange={e => setAuditChecks({ ...auditChecks, fin: e.target.checked })} />
                <span>Balanço Patrimonial com Liquidez e Saúde Financeira (+25 pts)</span>
              </label>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-200">
              <span className="text-xs text-slate-500">Nota IQF Calculada:</span>
              <p className="text-xl font-black text-emerald-700">
                {Object.values(auditChecks).filter(Boolean).length * 25} / 100
              </p>
            </div>

            <button 
              onClick={handleSaveAudit}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-lg transition"
            >
              Concluir Auditoria e Homologar
            </button>
          </div>
        </div>
      )}

      {/* MODAL NOVO FORNECEDOR */}
      {showNewSupplierModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">Cadastrar Novo Fornecedor</h3>
              <button onClick={() => setShowNewSupplierModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Razão Social:</label>
                <input 
                  type="text" 
                  value={newSupplierForm.name} 
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })} 
                  placeholder="Ex: BioIngredients Brasil Ltda"
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Origem:</label>
                <input 
                  type="text" 
                  value={newSupplierForm.origin} 
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, origin: e.target.value })} 
                  placeholder="Ex: Campinas / SP"
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Insumo Principal:</label>
                <input 
                  type="text" 
                  value={newSupplierForm.raw} 
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, raw: e.target.value })} 
                  placeholder="Ex: Aroma Idêntico ao Natural"
                  className="w-full border rounded p-2"
                />
              </div>
            </div>
            <button 
              onClick={() => {
                if (!newSupplierForm.name.trim()) return alert('Informe a razão social.');
                const newSup = {
                  id: `sup-${Date.now()}`,
                  name: newSupplierForm.name.trim(),
                  origin: newSupplierForm.origin.trim() || 'Nacional',
                  raw: newSupplierForm.raw.trim() || 'Matéria-Prima',
                  iqf: 0,
                  status: 'Auditoria Pendente'
                };
                setSuppliers(prev => [...prev, newSup]);
                setShowNewSupplierModal(false);
                alert(`Fornecedor ${newSup.name} cadastrado com sucesso!`);
              }}
              className="w-full bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg"
            >
              Salvar Cadastro
            </button>
          </div>
        </div>
      )}

      {/* MODAL MATRIZ INCOTERMS 2020 */}
      {showIncotermsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">Guia Prático: Incoterms 2020 (Comércio Global)</h3>
              <button onClick={() => setShowIncotermsModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <strong className="text-blue-900 block mb-1">FOB (Free On Board) - Porto de Origem:</strong>
                O exportador entrega a mercadoria a bordo do navio. O frete internacional e o seguro são contratados e pagos pelo comprador (NutriVita).
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <strong className="text-emerald-900 block mb-1">CIF (Cost, Insurance and Freight) - Porto de Destino:</strong>
                O exportador arca com todos os custos de transporte internacional e seguro até o porto brasileiro de destino (Santos).
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <strong className="text-amber-900 block mb-1">EXW (Ex Works) - Na Fábrica do Vendedor:</strong>
                Mínima obrigação para o vendedor. O comprador retira a mercadoria no galpão do fabricante e assume todos os riscos e custos.
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <strong className="text-purple-900 block mb-1">DDP (Delivered Duty Paid) - Na Fábrica do Comprador:</strong>
                Máxima responsabilidade do exportador. A mercadoria é entregue desembaraçada e com impostos pagos na fábrica de Extrema/MG.
              </div>
            </div>
            <button onClick={() => setShowIncotermsModal(false)} className="w-full bg-slate-800 text-white font-bold text-xs py-2 rounded-lg">
              Fechar Guia
            </button>
          </div>
        </div>
      )}

      {/* MODAL PO SUCESSO */}
      {showPoSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Pedido PO #2026-0042 Transmitido!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A ordem de compra foi gerada e enviada via EDI ao fornecedor <strong>{poSupplier}</strong>. O orçamento foi debitado e o rastreamento foi iniciado na Torre de Follow-up.
            </p>
            <button 
              onClick={() => {
                setShowPoSuccessModal(false);
                handleSwitchTab(6);
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-lg transition"
            >
              Acompanhar Carga na Torre de Follow-up ➔
            </button>
          </div>
        </div>
      )}

      {/* MISSION CONTROL FLUTUANTE (DOCENTE) */}
      {isMissionControlOpen && (
        <div className="fixed inset-y-0 right-0 w-[440px] bg-slate-950 text-white shadow-2xl p-6 overflow-y-auto z-50 border-l border-slate-800 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-emerald-400">Mission Control (Docente)</h2>
              <p className="text-xs text-slate-400">Injeção de crises, controle do ritmo e fluxo físico</p>
            </div>
            <button onClick={() => setIsMissionControlOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
          </div>

          {/* Controle do Trânsito Inbound */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Avançar Carga Inbound (PO #0042)</h3>
              <span className="text-xs text-amber-400 font-bold">Gatilho de Estoque</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200 text-xs">PO #2026-0042 • Cacau Global</p>
                <span className="text-xs text-amber-300 font-bold block mt-0.5">Marco {inboundStage} de 5</span>
              </div>
              <button 
                onClick={advanceKanbanMilestone}
                disabled={inboundStage >= 5}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-3 py-1.5 rounded text-xs transition"
              >
                Avançar Marco ➔
              </button>
            </div>
            <button 
              onClick={() => setIsAutoTransitActive(prev => !prev)}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5 transition"
            >
              ⏱ Trânsito Automático: {isAutoTransitActive ? 'Ativo (35s)' : 'Pausado'}
            </button>
          </div>

          {/* Injeção de RCs em Tempo Real */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Disparar Demanda (RC) em Tempo Real</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => {
                  const newRc = {
                    id: `RC-${Math.floor(200 + Math.random() * 800)}`,
                    dept: 'Produção / PCP',
                    item: 'Cacau em Pó Alcalino Premium',
                    itemType: 'cacau',
                    qty: '2.500 kg',
                    urgency: 'Alta',
                    status: 'Pendente',
                    date: 'Agora'
                  };
                  setRequisitions(prev => [newRc, ...prev]);
                  alert('[Mission Control] Nova demanda PCP disparada com sucesso!');
                }}
                className="bg-emerald-800 hover:bg-emerald-700 p-3 rounded-lg font-bold text-left"
              >
                <span>RC Matéria-Prima</span>
                <span className="block text-[10px] text-emerald-200 font-normal mt-1">Cacau ou Whey</span>
              </button>
              <button 
                onClick={() => {
                  const newRc = {
                    id: `RC-${Math.floor(200 + Math.random() * 800)}`,
                    dept: 'Logística / MRO',
                    item: 'Paletes PBR Madeira Tratada',
                    itemType: 'filme',
                    qty: '150 un',
                    urgency: 'Alta',
                    status: 'Pendente',
                    date: 'Agora'
                  };
                  setRequisitions(prev => [newRc, ...prev]);
                  alert('[Mission Control] Nova demanda MRO disparada com sucesso!');
                }}
                className="bg-blue-800 hover:bg-blue-700 p-3 rounded-lg font-bold text-left"
              >
                <span>RC Indiretos (MRO)</span>
                <span className="block text-[10px] text-blue-200 font-normal mt-1">Paletes ou Filme</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
