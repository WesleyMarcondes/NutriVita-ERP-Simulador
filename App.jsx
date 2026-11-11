import React, { useState } from 'react';
import { 
  LayoutDashboard, Calculator, Globe, Mail, ShoppingCart, AlertTriangle, 
  Settings, CheckCircle, XCircle, Info, Send, ArrowRight, Truck, CheckSquare, 
  ChevronRight, Building2, Package, ShieldCheck, ArrowUpRight
} from 'lucide-react';

// Dados Iniciais e Constantes
const INITIAL_RCS = [
  { id: 'RC-101', type: 'Produção / PCP', item: 'Massa de Cacau Fina 100%', qty: '1.000 kg', urgency: 'Alta', status: 'Pendente', date: 'Hoje, 08:30' },
  { id: 'RC-102', type: 'Logística / MRO', item: 'Filme Stretch Automático 500mm', qty: '80 bobinas', urgency: 'Média', status: 'Pendente', date: 'Hoje, 09:15' }
];

const KPI_HELP = {
  budget: {
    title: 'Orçamento Disponível (Budget de Compras)',
    desc: 'Representa o teto de capital de giro alocado para compras no período. Toda emissão de PO deduz este valor. O objetivo do analista é manter a operação abastecida com menor dispêndio possível.'
  },
  saving: {
    title: 'Saving Acumulado (Economia Negociada)',
    desc: 'Diferença financeira positiva entre o preço orçado (baseline) e o valor final fechado na negociação. Demonstra a geração de valor estratégico da equipe de suprimentos.'
  },
  serviceLevel: {
    title: 'Nível de Serviço (OTIF - On-Time In-Full)',
    desc: 'Mede a precisão das entregas: pedidos entregues na data combinada e sem inconformidades de quantidade ou qualidade. A meta corporativa é >= 95%.'
  },
  occupation: {
    title: 'Taxa de Ocupação do Armazém',
    desc: 'Volume físico ocupado no armazém da fábrica. Atualizado organicamente apenas quando o pedido é liberado da Inspeção de Qualidade para o Estoque no Kanban da Portaria.'
  }
};

const AUDIT_CHECKLIST_ITEMS = [
  { id: 'alvara', label: 'Possui Alvará Sanitário e Licença Ambiental Vigentes (+25 pts)' },
  { id: 'cnd', label: 'Certidão Negativa de Débitos (CND) e regularidade fiscal (+25 pts)' },
  { id: 'haccp', label: 'Certificação ISO 22000 / HACCP / Boas Práticas (+25 pts)' },
  { id: 'financeiro', label: 'Balanço Patrimonial e Capacidade Financeira aprovados (+25 pts)' }
];

const RUBRIC_ITEMS = [
  { id: 1, type: 'Técnica', text: 'Realizou o cálculo correto do MRP (PP e EMax) pelo Assistente' },
  { id: 2, type: 'Técnica', text: 'Realizou Auditoria Documental e compôs o IQF corretamente' },
  { id: 3, type: 'Socioemocional', text: 'Redigiu e-mail profissional e negociou TCA formalmente' },
  { id: 4, type: 'Técnica', text: 'Emitiu PO completo com Incoterm, CNPJ e Modal adequados' },
  { id: 5, type: 'Técnica', text: 'Acompanhou o fluxo logístico no Kanban até liberação em estoque' }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState(1);
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);
  const [activeKpiModal, setActiveKpiModal] = useState(null);

  // KPIs
  const [kpis, setKpis] = useState({
    budget: 150000,
    saving: 14500,
    serviceLevel: 98,
    occupation: 45
  });

  // Requisições de Compras (RCs)
  const [requisitions, setRequisitions] = useState(INITIAL_RCS);

  // MRP Step-by-Step State
  const [mrpData, setMrpData] = useState({ cm: 100, lt: 5, emin: 200, lote: 1000 });
  const [mrpStep, setMrpStep] = useState(4); // 1 a 4

  // Homologação de Fornecedores
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Cacau Global Corp', origin: 'Internacional (Gana)', iqf: 95, status: 'Homologado', raw: 'Massa de Cacau' },
    { id: 2, name: 'Vale Lácteos S/A', origin: 'Nacional (MG)', iqf: 82, status: 'Auditoria Pendente', raw: 'Whey Protein 80%' },
    { id: 3, name: 'Polipack Embalagens', origin: 'Nacional (SP)', iqf: 88, status: 'Homologado', raw: 'Filme Stretch MRO' }
  ]);
  const [auditModalSupplier, setAuditModalSupplier] = useState(null);
  const [auditChecks, setAuditChecks] = useState({});
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({ name: '', origin: 'Nacional', raw: '' });

  // Webmail Corporativo
  const [emails, setEmails] = useState([
    {
      id: 1,
      from: 'comercial@cacauglobal.com',
      sender: 'Cacau Global Corp (Gana)',
      subject: 'Proposta Comercial Cotação #2026-88 - Massa de Cacau',
      date: '10:45',
      unread: true,
      body: 'Prezado Analista de Suprimentos NutriVita,\n\nConforme solicitado, informamos nossa melhor condição para fornecimento de 1.000 kg de Massa de Cacau:\n- Preço FOB Tema: US$ 4.20/kg\n- Lead time de embarque: 15 dias\n- Pagamento: Carta de Crédito à vista.\n\nAguardamos vossa contraproposta técnica ou aprovação da TCA.',
      history: []
    },
    {
      id: 2,
      from: 'vendas@valelacteos.com.br',
      sender: 'Vale Lácteos S/A',
      subject: 'Cadastro e Cotação de Fornecimento - Whey Protein 80%',
      date: '09:20',
      unread: false,
      body: 'Olá equipe NutriVita,\n\nEncaminhamos nossa ficha cadastral para homologação e cotação de Whey Protein Concentrado a R$ 29,50/kg CIF fábrica. Por favor, realizem nossa auditoria de IQF no portal para liberação da PO.',
      history: []
    }
  ]);
  const [selectedEmailId, setSelectedEmailId] = useState(1);
  const [emailReplyText, setEmailReplyText] = useState('');

  // PO Completo & Kanban de Entregas
  const [poForm, setPoForm] = useState({
    supplier: 'Cacau Global Corp',
    cnpj: '00.123.456/0001-89',
    item: 'Massa de Cacau Fina 100%',
    qty: 1000,
    price: 27.67,
    incoterm: 'FOB',
    modal: 'Marítimo',
    paymentTerms: '30 dias DDL',
    deliveryAddress: 'Fábrica NutriVita - Extrema / MG'
  });

  // Kanban do Professor (Entregas)
  // Colunas: 'transito' -> 'portaria' -> 'qualidade' -> 'estoque'
  const [kanbanOrders, setKanbanOrders] = useState([
    {
      id: 'PO-2026-0038',
      supplier: 'Polipack Embalagens',
      item: 'Filme Stretch Automático',
      qty: 80,
      stage: 'transito'
    }
  ]);

  // Câmbio e Rubrica Docente
  const [exchangeRate, setExchangeRate] = useState({ usd: 5.10, eur: 5.45 });
  const [evaluation, setEvaluation] = useState({});

  // Fórmulas MRP
  const pp = (mrpData.cm * mrpData.lt) + mrpData.emin;
  const emax = mrpData.emin + mrpData.lote;

  // Disparo de RCs pelo Professor
  const triggerNewRC = (type) => {
    const isPCP = type === 'pcp';
    const newRC = {
      id: `RC-${Math.floor(100 + Math.random() * 900)}`,
      type: isPCP ? 'Produção / PCP' : 'Logística / MRO',
      item: isPCP ? 'Cacau em Pó Alcalino Premium' : 'Paletes PBR Madeira Tratada',
      qty: isPCP ? '2.500 kg' : '150 unidades',
      urgency: 'Alta',
      status: 'Pendente',
      date: 'Agora'
    };
    setRequisitions(prev => [newRC, ...prev]);
    alert(`[Mission Control] Nova ${newRC.type} disparada com sucesso para o aluno!`);
  };

  // Resposta de e-mail realista pelo aluno
  const handleSendEmailReply = () => {
    if (!emailReplyText.trim()) return;
    const currentEmail = emails.find(e => e.id === selectedEmailId);
    if (!currentEmail) return;

    const replyEntry = { sender: 'Você (NutriVita Compras)', text: emailReplyText, time: 'Agora' };
    
    // Simulação de resposta da IA do Fornecedor com TCA negociado
    let counterReply = {
      sender: currentEmail.sender,
      text: `Agradecemos sua contraproposta detalhada. Analisamos seus argumentos comerciais e aceitamos conceder 4.5% de desconto no lote ou adequar o prazo de pagamento para 45 dias. O Quadro TCA pode ser consolidado para emissão do Pedido de Compra (PO).`,
      time: '1 min depois'
    };

    setEmails(prev => prev.map(e => {
      if (e.id === selectedEmailId) {
        return {
          ...e,
          history: [...(e.history || []), replyEntry, counterReply]
        };
      }
      return e;
    }));

    setEmailReplyText('');
    setKpis(k => ({ ...k, saving: k.saving + 1250 }));
  };

  // Auditoria IQF
  const openAuditModal = (supp) => {
    setAuditModalSupplier(supp);
    setAuditChecks({});
  };

  const handleSaveAudit = () => {
    const score = Object.values(auditChecks).filter(Boolean).length * 25;
    const newStatus = score >= 75 ? 'Homologado' : 'Reprovado / Pendente';
    setSuppliers(prev => prev.map(s => s.id === auditModalSupplier.id ? { ...s, iqf: score, status: newStatus } : s));
    setAuditModalSupplier(null);
  };

  // Cadastro Manual de Fornecedor vindo do Webmail
  const handleCreateSupplier = (e) => {
    e.preventDefault();
    if (!newSupplierData.name) return;
    const newSupp = {
      id: Date.now(),
      name: newSupplierData.name,
      origin: newSupplierData.origin,
      iqf: 50,
      status: 'Auditoria Pendente',
      raw: newSupplierData.raw || 'Insumo Geral'
    };
    setSuppliers(prev => [...prev, newSupp]);
    setShowNewSupplierForm(false);
    setNewSupplierData({ name: '', origin: 'Nacional', raw: '' });
  };

  // Emissão de PO pelo Aluno
  const handleEmitPO = (e) => {
    e.preventDefault();
    const newPoId = `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: newPoId,
      supplier: poForm.supplier,
      item: poForm.item,
      qty: poForm.qty,
      stage: 'transito'
    };
    setKanbanOrders(prev => [newOrder, ...prev]);
    setKpis(k => ({ ...k, budget: Math.max(0, k.budget - (poForm.qty * poForm.price)) }));
    alert(`Pedido de Compra ${newPoId} emitido com sucesso! O pedido agora está em trânsito no Kanban do Professor.`);
  };

  // Avanço do Kanban pelo Professor
  const advanceKanbanOrder = (orderId) => {
    const order = kanbanOrders.find(o => o.id === orderId);
    if (!order) return;

    let nextStage = '';
    if (order.stage === 'transito') nextStage = 'portaria';
    else if (order.stage === 'portaria') nextStage = 'qualidade';
    else if (order.stage === 'qualidade') {
      nextStage = 'estoque';
      // ATUALIZAÇÃO ORGÂNICA DO ESTOQUE E OCUPAÇÃO NO DASHBOARD DO ALUNO
      setKpis(k => ({
        ...k,
        occupation: Math.min(100, k.occupation + 8),
        serviceLevel: 99
      }));
    }

    if (nextStage) {
      setKanbanOrders(prev => prev.map(o => o.id === orderId ? { ...o, stage: nextStage } : o));
    }
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">N</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">NutriVita ERP</h1>
              <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider">Alta Realidade</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { id: 1, label: 'Dashboard & RCs', icon: <LayoutDashboard size={18} /> },
            { id: 2, label: 'MRP & Dente de Serra', icon: <Calculator size={18} /> },
            { id: 3, label: 'Homologação & Auditoria', icon: <Globe size={18} /> },
            { id: 4, label: 'Webmail Corporativo', icon: <Mail size={18} /> },
            { id: 5, label: 'Emissão de Pedidos (PO)', icon: <ShoppingCart size={18} /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-sm font-medium transition ${
                currentTab === item.id ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={() => setIsMissionControlOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Settings size={16} className="text-emerald-400" /> Mission Control
          </button>
        </div>
      </aside>

      {/* Conteúdo Central */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* TAB 1: DASHBOARD & REQUISIÇÕES (RCs) */}
        {currentTab === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Painel do Analista de Suprimentos</h2>
                <p className="text-sm text-slate-500">Monitore KPIs corporativos e processe as Requisições de Compras (RCs) pendentes.</p>
              </div>
            </div>

            {/* KPIs com Ícones de Letramento / Informação */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
                <button onClick={() => setActiveKpiModal('budget')} className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600">
                  <Info size={16} />
                </button>
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Orçamento Disponível</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">R$ {kpis.budget.toLocaleString('pt-BR')}</p>
                <span className="text-[11px] text-slate-400">Clique no (i) para letramento</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
                <button onClick={() => setActiveKpiModal('saving')} className="absolute top-4 right-4 text-slate-400 hover:text-blue-600">
                  <Info size={16} />
                </button>
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Saving Acumulado</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">R$ {kpis.saving.toLocaleString('pt-BR')}</p>
                <span className="text-[11px] text-emerald-600 font-semibold">+8.4% vs orçamento</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
                <button onClick={() => setActiveKpiModal('serviceLevel')} className="absolute top-4 right-4 text-slate-400 hover:text-purple-600">
                  <Info size={16} />
                </button>
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Nível de Serviço (OTIF)</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{kpis.serviceLevel}%</p>
                <span className="text-[11px] text-slate-400">Meta fabril: &gt;= 95%</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
                <button onClick={() => setActiveKpiModal('occupation')} className="absolute top-4 right-4 text-slate-400 hover:text-amber-600">
                  <Info size={16} />
                </button>
                <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Ocupação do Armazém</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{kpis.occupation}%</p>
                <span className="text-[11px] text-slate-400">Atualizado via Portaria</span>
              </div>
            </div>

            {/* Caixa de Entrada de Requisições de Compras (RCs) */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Caixa de Entrada de Requisições de Compras (RCs)</h3>
                  <p className="text-xs text-slate-500">Demandas internas emitidas pelo PCP (Produção Direta) e Almoxarifado (MRO Indiretos).</p>
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">
                  {requisitions.length} Pendentes
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {requisitions.map(rc => (
                  <div key={rc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-lg ${rc.type.includes('PCP') ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                        {rc.type.includes('PCP') ? <Package size={20} /> : <Truck size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">{rc.id}: {rc.item}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            rc.type.includes('PCP') ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>{rc.type}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Volume Solicitado: <strong>{rc.qty}</strong> • Recebido {rc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded">
                        Urgência: {rc.urgency}
                      </span>
                      <button 
                        onClick={() => setCurrentTab(2)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition"
                      >
                        Dimensionar no MRP <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MRP COM ASSISTENTE PASSO A PASSO */}
        {currentTab === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Cálculo MRP com Assistente Passo a Passo</h2>
              <p className="text-sm text-slate-500">Valide cada etapa técnica para calcular o Ponto de Pedido e formar o gráfico dente de serra.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Checklist / Assistente Lateral */}
              <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Assistente de Validação de Etapas</h3>

                {/* Etapa 1: Consumo */}
                <div className={`p-4 rounded-lg border transition ${mrpStep >= 1 ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-700">Etapa 1: Consumo Médio Diário (CM)</span>
                    {mrpStep > 1 && <CheckCircle size={16} className="text-emerald-600" />}
                  </div>
                  <input 
                    type="number" 
                    value={mrpData.cm} 
                    onChange={e => setMrpData({ ...mrpData, cm: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-sm bg-white font-bold"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Taxa diária de esgotamento pelo plano mestre de produção.</p>
                </div>

                {/* Etapa 2: Lead Time */}
                <div className={`p-4 rounded-lg border transition ${mrpStep >= 2 ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50 opacity-80'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-700">Etapa 2: Lead Time do Fornecedor (LT)</span>
                    {mrpStep > 2 && <CheckCircle size={16} className="text-emerald-600" />}
                  </div>
                  <input 
                    type="number" 
                    value={mrpData.lt} 
                    onChange={e => setMrpData({ ...mrpData, lt: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-sm bg-white font-bold"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Dias entre emissão do pedido e descarga na portaria.</p>
                </div>

                {/* Etapa 3: Estoque Mínimo */}
                <div className={`p-4 rounded-lg border transition ${mrpStep >= 3 ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50 opacity-80'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-700">Etapa 3: Estoque de Segurança / Mínimo (EMin)</span>
                    {mrpStep > 3 && <CheckCircle size={16} className="text-emerald-600" />}
                  </div>
                  <input 
                    type="number" 
                    value={mrpData.emin} 
                    onChange={e => setMrpData({ ...mrpData, emin: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-sm bg-white font-bold"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Colchão protetor contra flutuações e atrasos portuários.</p>
                </div>

                {/* Etapa 4: Lote de Compra */}
                <div className={`p-4 rounded-lg border transition ${mrpStep >= 4 ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200 bg-slate-50 opacity-80'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-700">Etapa 4: Lote de Reposição (Q)</span>
                    {mrpStep >= 4 && <CheckCircle size={16} className="text-emerald-600" />}
                  </div>
                  <input 
                    type="number" 
                    value={mrpData.lote} 
                    onChange={e => setMrpData({ ...mrpData, lote: Number(e.target.value) })}
                    className="w-full border rounded p-2 text-sm bg-white font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Ponto de Pedido (PP):</span>
                    <strong className="text-emerald-400 text-lg">{pp} un</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Estoque Máximo (EMax):</span>
                    <strong className="text-blue-400 text-lg">{emax} un</strong>
                  </div>
                </div>
              </div>

              {/* Gráfico Dente de Serra Dinâmico */}
              <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Gráfico Dente de Serra Interativo</h3>
                  <div className="flex gap-3 text-xs">
                    <span className="text-blue-600 font-bold">EMax: {emax}</span>
                    <span className="text-emerald-600 font-bold">PP: {pp}</span>
                    <span className="text-red-500 font-bold">EMin: {mrpData.emin}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <svg viewBox="0 0 400 240" className="w-full h-auto">
                    {/* Eixos */}
                    <line x1="40" y1="20" x2="40" y2="210" stroke="#64748b" strokeWidth="2" />
                    <line x1="40" y1="210" x2="380" y2="210" stroke="#64748b" strokeWidth="2" />
                    <text x="350" y="230" fontSize="10" fill="#64748b">Tempo</text>

                    {/* Faixa Estoque Mínimo */}
                    <rect x="40" y="160" width="340" height="50" fill="#fee2e2" opacity="0.6" />
                    <line x1="40" y1="160" x2="380" y2="160" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
                    <text x="5" y="165" fontSize="10" fill="#ef4444" fontWeight="bold">EMin</text>

                    {/* Linha Ponto de Pedido */}
                    <line x1="40" y1="110" x2="380" y2="110" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
                    <text x="10" y="115" fontSize="10" fill="#10b981" fontWeight="bold">PP</text>

                    {/* Linha Estoque Máximo */}
                    <line x1="40" y1="40" x2="380" y2="40" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
                    <text x="5" y="45" fontSize="10" fill="#3b82f6" fontWeight="bold">EMax</text>

                    {/* Curvas de Consumo Dente de Serra */}
                    <polyline points="40,40 170,160" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <line x1="170" y1="160" x2="170" y2="40" stroke="#10b981" strokeWidth="2" strokeDasharray="3" />
                    <polyline points="170,40 300,160" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <line x1="300" y1="160" x2="300" y2="40" stroke="#10b981" strokeWidth="2" strokeDasharray="3" />
                  </svg>
                </div>

                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-semibold">Cálculo de Necessidade Concluído com Sucesso!</span>
                  <button onClick={() => setCurrentTab(3)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-bold flex items-center gap-1">
                    Avançar para Homologação <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOMOLOGAÇÃO & AUDITORIA DE FORNECEDORES */}
        {currentTab === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Homologação & Auditoria de IQF</h2>
                <p className="text-sm text-slate-500">Cadastre fornecedores recebidos do Webmail e realize a auditoria documental de conformidade.</p>
              </div>
              <button 
                onClick={() => setShowNewSupplierForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
              >
                + Cadastrar Novo Fornecedor do Webmail
              </button>
            </div>

            {/* Formulário de Cadastro Manual */}
            {showNewSupplierForm && (
              <form onSubmit={handleCreateSupplier} className="bg-white p-5 rounded-xl border-2 border-emerald-500 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">Ficha de Entrada de Novo Fornecedor</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Razão Social / Nome</label>
                    <input 
                      type="text" 
                      placeholder="Ex: EuroFlavors BV"
                      value={newSupplierData.name} 
                      onChange={e => setNewSupplierData({ ...newSupplierData, name: e.target.value })}
                      className="w-full border rounded p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Origem</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Internacional (Holanda)"
                      value={newSupplierData.origin} 
                      onChange={e => setNewSupplierData({ ...newSupplierData, origin: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Insumo Ofertado</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Aromas Funcionais"
                      value={newSupplierData.raw} 
                      onChange={e => setNewSupplierData({ ...newSupplierData, raw: e.target.value })}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowNewSupplierForm(false)} className="text-xs px-3 py-1.5 border rounded">Cancelar</button>
                  <button type="submit" className="text-xs px-4 py-1.5 bg-emerald-600 text-white font-bold rounded">Salvar no Sistema</button>
                </div>
              </form>
            )}

            {/* Tabela de Fornecedores */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5 font-bold">Fornecedor</th>
                    <th className="px-6 py-3.5 font-bold">Origem</th>
                    <th className="px-6 py-3.5 font-bold">Insumo</th>
                    <th className="px-6 py-3.5 font-bold">Nota IQF</th>
                    <th className="px-6 py-3.5 font-bold">Status de Compliance</th>
                    <th className="px-6 py-3.5 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="px-6 py-4 text-xs">{s.origin}</td>
                      <td className="px-6 py-4 text-xs">{s.raw}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600">{s.iqf}/100</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.status === 'Homologado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openAuditModal(s)}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Auditar IQF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: WEBMAIL CORPORATIVO (OUTLOOK STYLE COM RESPOSTA LIVRE) */}
        {currentTab === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Webmail Corporativo de Suprimentos</h2>
              <p className="text-sm text-slate-500">Negocie diretamente com os fornecedores redigindo argumentos formais de contraproposta.</p>
            </div>

            <div className="grid grid-cols-12 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-[500px]">
              {/* Lista de E-mails Lateral */}
              <div className="col-span-4 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-3 border-b border-slate-200 bg-white">
                  <span className="text-xs font-bold uppercase text-slate-500">Caixa de Entrada ({emails.length})</span>
                </div>
                <div className="divide-y divide-slate-200 overflow-y-auto">
                  {emails.map(email => (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmailId(email.id)}
                      className={`w-full text-left p-4 transition ${
                        selectedEmailId === email.id ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-bold text-xs text-slate-800 truncate">{email.sender}</span>
                        <span className="text-[10px] text-slate-400">{email.date}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 truncate">{email.subject}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-1">{email.body}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Leitura e Resposta do E-mail */}
              <div className="col-span-8 p-6 flex flex-col justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <h3 className="text-lg font-bold text-slate-800">{selectedEmail.subject}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex justify-between">
                      <span>De: <strong>{selectedEmail.sender}</strong> &lt;{selectedEmail.from}&gt;</span>
                      <span>Para: compras@nutrivitafoods.com.br</span>
                    </div>
                  </div>

                  {/* Corpo da mensagem */}
                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-200/80">
                    {selectedEmail.body}
                  </div>

                  {/* Histórico de Negociação */}
                  {selectedEmail.history && selectedEmail.history.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase text-slate-500">Histórico da Negociação:</h4>
                      {selectedEmail.history.map((h, i) => (
                        <div key={i} className={`p-3 rounded-lg text-xs ${h.sender.includes('Você') ? 'bg-blue-50 border border-blue-200 ml-4' : 'bg-emerald-50 border border-emerald-200 mr-4'}`}>
                          <div className="flex justify-between font-bold mb-1 text-slate-700">
                            <span>{h.sender}</span>
                            <span className="text-[10px] text-slate-400">{h.time}</span>
                          </div>
                          <p className="text-slate-600">{h.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Caixa de Redação Livre */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Redigir Contraproposta / Argumento de Negociação:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escreva sua argumentação formal (ex: solicitando desconto por volume, alteração de Incoterm FOB para CIF, ou prazo de pagamento)..."
                    value={emailReplyText}
                    onChange={e => setEmailReplyText(e.target.value)}
                    className="w-full border rounded-lg p-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[11px] text-slate-400">Argumentos técnicos desbloqueiam descontos de Saving no orçamento.</span>
                    <button 
                      onClick={handleSendEmailReply}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Send size={14} /> Enviar Mensagem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EMISSÃO DE PEDIDOS (PO) COMPLETA */}
        {currentTab === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Emissão de Pedido de Compra Completo (PO)</h2>
              <p className="text-sm text-slate-500">Formalize a contratação com rigor corporativo para envio ao fluxo logístico.</p>
            </div>

            <form onSubmit={handleEmitPO} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fornecedor Homologado</label>
                  <select 
                    value={poForm.supplier} 
                    onChange={e => setPoForm({ ...poForm, supplier: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    {suppliers.filter(s => s.status === 'Homologado').map(s => (
                      <option key={s.id} value={s.name}>{s.name} (IQF: {s.iqf})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNPJ do Fornecedor</label>
                  <input 
                    type="text" 
                    value={poForm.cnpj} 
                    onChange={e => setPoForm({ ...poForm, cnpj: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Item / Especificação Técnica</label>
                  <input 
                    type="text" 
                    value={poForm.item} 
                    onChange={e => setPoForm({ ...poForm, item: e.target.value })}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantidade do Lote (Q)</label>
                  <input 
                    type="number" 
                    value={poForm.qty} 
                    onChange={e => setPoForm({ ...poForm, qty: Number(e.target.value) })}
                    className="w-full border rounded p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preço Unitário Negociado (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={poForm.price} 
                    onChange={e => setPoForm({ ...poForm, price: Number(e.target.value) })}
                    className="w-full border rounded p-2 font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Incoterm 2020</label>
                  <select 
                    value={poForm.incoterm} 
                    onChange={e => setPoForm({ ...poForm, incoterm: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="FOB">FOB (Free on Board)</option>
                    <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                    <option value="DDP">DDP (Delivered Duty Paid)</option>
                    <option value="EXW">EXW (Ex Works)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modal de Transporte</label>
                  <select 
                    value={poForm.modal} 
                    onChange={e => setPoForm({ ...poForm, modal: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="Marítimo">Marítimo (Contêiner)</option>
                    <option value="Rodoviário">Rodoviário (Caminhão Fechado)</option>
                    <option value="Aéreo">Aéreo Expresso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condição de Pagamento</label>
                  <input 
                    type="text" 
                    value={poForm.paymentTerms} 
                    onChange={e => setPoForm({ ...poForm, paymentTerms: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Local de Entrega Fabril</label>
                  <input 
                    type="text" 
                    value={poForm.deliveryAddress} 
                    onChange={e => setPoForm({ ...poForm, deliveryAddress: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Valor Total da Ordem de Compra:</span>
                  <p className="text-xl font-black text-emerald-700">R$ {(poForm.qty * poForm.price).toLocaleString('pt-BR')}</p>
                </div>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition">
                  Emitir e Transmitir PO
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* MODAL DE LETRAMENTO TÉCNICO DOS KPIS */}
      {activeKpiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{KPI_HELP[activeKpiModal].title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{KPI_HELP[activeKpiModal].desc}</p>
            <button 
              onClick={() => setActiveKpiModal(null)}
              className="mt-6 w-full bg-slate-800 text-white text-xs font-bold py-2 rounded-lg"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE AUDITORIA MANUAL DE IQF */}
      {auditModalSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800">Auditoria Documental de Fornecedor</h3>
                <p className="text-xs text-slate-500">Empresa: {auditModalSupplier.name}</p>
              </div>
              <button onClick={() => setAuditModalSupplier(null)}><XCircle size={20} className="text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              {AUDIT_CHECKLIST_ITEMS.map(item => (
                <label key={item.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border cursor-pointer hover:bg-slate-100 transition">
                  <input 
                    type="checkbox" 
                    checked={!!auditChecks[item.id]} 
                    onChange={e => setAuditChecks({ ...auditChecks, [item.id]: e.target.checked })}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="p-3 bg-slate-100 rounded text-center">
              <span className="text-xs text-slate-500">Nota IQF Calculada:</span>
              <p className="text-xl font-black text-emerald-600">
                {Object.values(auditChecks).filter(Boolean).length * 25} / 100
              </p>
            </div>

            <button 
              onClick={handleSaveAudit}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs transition"
            >
              Concluir Auditoria e Homologar
            </button>
          </div>
        </div>
      )}

      {/* MISSION CONTROL (DOCENTE - O DONO DO FLUXO) */}
      {isMissionControlOpen && (
        <div className="fixed inset-y-0 right-0 w-[520px] bg-slate-900 text-white shadow-2xl p-6 overflow-y-auto z-50 border-l border-slate-700">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-emerald-400">Mission Control (Docente)</h2>
              <p className="text-xs text-slate-400">Controle do ritmo da aula, injeção de demandas e gestão do fluxo logístico.</p>
            </div>
            <button onClick={() => setIsMissionControlOpen(false)} className="text-slate-400 hover:text-white">
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Disparo de RCs em Tempo Real */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold uppercase text-slate-300 mb-3 tracking-wider">Disparar Demanda / RC na tela do Aluno</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => triggerNewRC('pcp')}
                  className="bg-emerald-700 hover:bg-emerald-600 p-3 rounded-lg text-xs font-bold text-left transition flex flex-col justify-between"
                >
                  <span>RC Produção / PCP</span>
                  <span className="text-[10px] text-emerald-200 mt-2 font-normal">Matérias-primas diretas</span>
                </button>
                <button 
                  onClick={() => triggerNewRC('mro')}
                  className="bg-blue-700 hover:bg-blue-600 p-3 rounded-lg text-xs font-bold text-left transition flex flex-col justify-between"
                >
                  <span>RC Logística / MRO</span>
                  <span className="text-[10px] text-blue-200 mt-2 font-normal">Compras indiretas e estoque</span>
                </button>
              </div>
            </div>

            {/* Kanban de Entregas (O Professor é o Dono do Fluxo) */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase text-slate-300 tracking-wider">Kanban Inbound (Portaria & Inspeção)</h3>
                <span className="text-[10px] text-amber-400 font-semibold">Gatilho de Estoque Físico</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                O estoque do armazém no Dashboard do aluno <strong>só é abastecido</strong> quando você avança o pedido até "Liberado para Estoque".
              </p>

              <div className="space-y-2">
                {kanbanOrders.map(order => (
                  <div key={order.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">{order.id} • {order.supplier}</p>
                      <p className="text-[11px] text-slate-400">{order.item} ({order.qty} un)</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.stage === 'transito' ? 'bg-amber-950 text-amber-300' :
                        order.stage === 'portaria' ? 'bg-blue-950 text-blue-300' :
                        order.stage === 'qualidade' ? 'bg-purple-950 text-purple-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        Etapa: {
                          order.stage === 'transito' ? '1. Em Trânsito' :
                          order.stage === 'portaria' ? '2. Portaria' :
                          order.stage === 'qualidade' ? '3. Inspeção Qualidade' : '4. Liberado no Estoque'
                        }
                      </span>
                    </div>

                    {order.stage !== 'estoque' ? (
                      <button 
                        onClick={() => advanceKanbanOrder(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded text-[11px] flex items-center gap-1"
                      >
                        Avançar <ArrowRight size={12} />
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-bold text-[11px]">Estoque Abastecido ✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mercado de Câmbio */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold uppercase text-slate-300 mb-2 tracking-wider">Câmbio de Moedas</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400">USD (Dólar)</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    value={exchangeRate.usd} 
                    onChange={e => setExchangeRate({ ...exchangeRate, usd: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-400">EUR (Euro)</label>
                  <input 
                    type="number" 
                    step="0.05" 
                    value={exchangeRate.eur} 
                    onChange={e => setExchangeRate({ ...exchangeRate, eur: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-white font-bold mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Rubrica de Avaliação */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold uppercase text-slate-300 mb-3 tracking-wider">Rubrica Oficial de Avaliação</h3>
              <div className="space-y-2 text-xs">
                {RUBRIC_ITEMS.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-slate-900 rounded">
                    <span className="text-slate-300 pr-2">{item.text}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEvaluation({ ...evaluation, [item.id]: 'A' })}
                        className={`px-2 py-0.5 rounded font-bold ${evaluation[item.id] === 'A' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                      >A</button>
                      <button 
                        onClick={() => setEvaluation({ ...evaluation, [item.id]: 'N' })}
                        className={`px-2 py-0.5 rounded font-bold ${evaluation[item.id] === 'N' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}
                      >N</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
