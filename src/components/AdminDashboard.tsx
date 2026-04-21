import { LOGO_3_CORACOES } from '../constants';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clipboard, 
  Link as LinkIcon, 
  CheckCircle, 
  Loader2, 
  Copy, 
  History, 
  LayoutDashboard, 
  Download,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Truck,
  User,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Info,
  Coffee,
  Clock,
  Settings,
  Save
} from 'lucide-react';
import { api } from '../services/api';
import { DriverData, Contract } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import { getCitiesForDestination, getForbiddenStopsForDestination } from '../utils/itineraryUtils';

const CHECKLIST_ITEMS = [
  "O VEÍCULO APRESENTA-SE LIMPO E EM BOAS CONDIÇÕES DE ACESSO AO DEPÓSITO.",
  "AUSÊNCIA DE VESTÍGIOS DE QUE TRANSPORTOU PRODUTOS QUÍMICOS OU QUALQUER OUTRO ITEM QUE POSSA CONTAMINAR O PRODUTO? (PNEUS, OUTROS ALIMENTOS OU PRODUTOS COM ODORES FORTES)",
  "AUSÊNCIA DE VESTÍGIOS DE OUTROS ALIMENTOS NO COMPARTIMENTO ARMAZENADOR DA CARGA.",
  "AUSÊNCIA DE ANIMAIS DOMÉSTICOS, COMO: CACHORRO, GATO, PÁSSARO E OUTROS, NO VEÍCULO.",
  "AUSÊNCIA DE PRAGAS E INSETOS MORTOS E/OU VIVOS.",
  "CARROCERIA SEM PRESENÇA DE IMPERFEIÇÕES QUE POSSAM CAUSAR AVARIAS AO PRODUTO.",
  "ESTADO GERAL DE CONSERVAÇÃO DO VEÍCULO (CABINE, CARROCERIA, ASSOALHO, LONA DO SIDER, BAÚ, PARA BARRO, ETC.)",
  "FARÓIS, LANTERNAS, PISCAS, BUZINA E LIMPADOR DE PÁRA-BRISA",
  "PNEUS (INCLUSIVE ESTEPE)",
  "PÁRA-CHOQUE (CONSERVAÇÃO E FIXAÇÃO)",
  "PÁRA-BRISA, ESPELHOS RETROVISORES, VIDROS LATERAIS",
  "TANQUE DE COMBUSTÍVEL",
  "EQUIPAMENTOS OBRIGATÓRIOS (CINTO, EXTINTOR, MACACO, CHAVE DE RODAS, TRIANGULO, QUEBRA-SOL, ETC.)",
  "FAIXAS REFLETIVAS",
  "VAZAMENTOS (COMBUSTÍVEL / FREIO/ AR/ ETC.)",
  "TACÓGRAFO (EQUIPAMENTO E DISCO",
  "TRAVESSA SIDER",
  "MADERITE",
  "VESTIMENTAS DO MOTORISTA QUANTO Á: UNIFORME, CRACHÁ CALÇADO, ETC.",
  "VEÍCULO ABASTECIDO"
];

const SECURITY_PHRASES = [
  "Segurança é a nossa prioridade número um.",
  "Dirija com cuidado, sua família te espera.",
  "A carga é importante, mas sua vida é essencial.",
  "Cumprir as normas de GR salva vidas.",
  "Atenção total no trânsito, zero acidentes.",
  "Sua integridade física vale mais que qualquer prazo.",
  "O Gerenciamento de Risco é seu maior aliado na estrada."
];

export const MAPA_REFERENCIA = {
  "NATAL - VIA MONTES CLAROS": "NATAL_MONTES_CLAROS.png",
  "NATAL - VIA ANTONIO DIAS": "NATAL_ANTONIO_DIAS.png",
  "NATAL - EUSEBIO": "NATAL_EUSEBIO.png",
  "SALVADOR - VIA CURVELO": "SALVADOR_CURVELO.png",
  "SALVADOR - VIA ANTONIO DIAS": "SALVADOR_ANTONIO_DIAS.png",
  "SALVADOR/BA (VIA CURVELO)": "SALVADOR_CURVELO.png",
  "SALVADOR/BA (VIA ANTONIO DIAS)": "SALVADOR_ANTONIO_DIAS.png",
  "NATAL/RN (VIA MONTES CLAROS)": "NATAL_MONTES_CLAROS.png",
  "NATAL/RN (VIA ANTONIO DIAS)": "NATAL_ANTONIO_DIAS.png",
  "CURITIBA (DESTRO)": "CURITIBA.png",
  "CURITIBA (CONDOR)": "CURITIBA.png",
  "XAXIM": "XAXIM.png",
  "PORTO VELHO": "PORTO VELHO.png",
  "BEBEDOURO": "BEBEDOURO.png",
  "BRASILIA": "BRASILIA.png",
  "CAMBE": "CAMBE.png",
  "CAMPO GRANDE": "CAMPO GRANDE.png",
  "CASTRO": "CASTRO.png",
  "CUIABA": "CUIABA.png",
  "CURITIBA": "CURITIBA.png",
  "NATAL": "NATAL.png",
  "EUSEBIO": "EUSEBIO.png",
  "GOV. CELSO RAMOS": "GOV. CELSO RAMOS.png",
  "GRAVATAI": "GRAVATAI.png",
  "GUARULHOS": "GUARULHOS.png",
  "JUIZ DE FORA": "JUIZ DE FORA.png",
  "LINHARES": "LINHARES.png",
  "MONTES CLAROS": "MONTES CLAROS.png",
  "ANTONIO DIAS": "ANTONIO DIAS.png",
  "PIRACICABA": "PIRACICABA.png",
  "VITORIA": "VITORIA.png",
  "RIO DE JANEIRO": "RIO DE JANEIRO.png",
  "SALVADOR": "SALVADOR.png",
  "PAVUNA": "PAVUNA.png",
  "FRANCA": "FRANCA.png",
  "PINHAIS": "PINHAIS.png",
  "MARILIA": "MARILIA.png",
  "LONDRINA": "LONDRINA.png",
  "BELO HORIZONTE": "BELO HORIZONTE.png",
  "SANTA LUZIA": "SANTA LUZIA.png"
};

export const AdminDashboard: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<DriverData | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'history' | 'settings' | 'idealizador'>('generate');
  const [termsData, setTermsData] = useState<any>(null);
  const [termsLoading, setTermsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchTerms = async () => {
    setTermsLoading(true);
    try {
      const data = await api.settings.getTerms();
      if (data) setTermsData(data);
    } catch (error) {
      console.error("Erro ao buscar termos:", error);
    } finally {
      setTermsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchTerms();
    }
  }, [activeTab]);

  const handleSaveTerms = async () => {
    setSaveLoading(true);
    try {
      await api.settings.updateTerms(termsData);
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar termos:", error);
      alert("Erro ao salvar configurações.");
    } finally {
      setSaveLoading(false);
    }
  };
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'signed' | 'pending'>('all');

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = contracts.filter(c => c.created_at.startsWith(date)).length;
      const [, month, day] = date.split('-');
      return { date: `${day}/${month}`, count };
    });
  };

  // 1. BUSCAR HISTÓRICO REAL DA API WORKER CLOUDFLARE
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.contracts.list();
      setContracts(data);
    } catch (error) {
      console.log("Erro ao acessar API Worker, não foi possível carregar o histórico.", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTab === 'history' || activeTab === 'dashboard') {
      fetchHistory();
      interval = setInterval(() => {
        fetchHistory();
      }, 10000); // 10 seconds polling
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % SECURITY_PHRASES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateAndSave = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      // Passo 2 & 3: Substituir a Função da IA pela Função de Texto (Parsing Manual)
      // Dividimos a linha da planilha (geralmente separada por TAB ao colar do Excel)
      const parts = inputText.split(/\t|;/).map(p => p.trim());
      console.log("Colunas detectadas:", parts);
      
      const parsedInfo: DriverData = {
        mes: parts[0] || '',
        origem: parts[1] || '',
        dia: parts[2] || '',
        data: parts[3] || '',
        contato_whats: parts[4] || '',
        hora_liberado: parts[5] || '',
        status: parts[6] || 'pendente',
        modelo_carreta: parts[7] || '',
        modelo_cavalo: parts[8] || '',
        fez_contato: parts[9] || '',
        destino: parts[10] || '',
        transportador: parts[11] || '',
        cavalo: parts[12] || '',
        carreta: parts[13] || '',
        n_pallets: parts[14] || '',
        pbt: parts[15] || '',
        m3: parts[16] || '',
        categoria: parts[17] || '',
        tecnologia: parts[18] || '',
        motorista: parts[19] || '',
        cpf: parts[20] || '',
        rg: parts[21] || '',
        cnh: parts[22] || '',
        telefone: parts[23] || '',
        vigencia_cadastro: parts[24] || '',
        codigo_transportadora: parts[25] || '',
        id_carga: parts[26] || '',
        estado_motorista: parts[27] || '',
        estado_cavalo: parts[28] || '',
        estado_carreta: parts[29] || '',
        pendencia: parts[30] || '',
        check_list: parts[31] || '',
        vinculo: parts[17] || '',
        valido: parts[33] || '',
        dias: parts[34] || '',
        carreta2: parts[35] || '',
        uf_placas: parts[28] || '', // Usando estado_cavalo como UF padrão
      };

      // Passo 1: Criar o "Termo Padrão" no Código
      const termoTemplate = `Declaro para os devidos fins, que fui contratado(a) pela transportadora, cujos dados seguem abaixo, para efetuar o transporte de carga do embarcador TRÊS CORAÇÕES ALIMENTOS S.A., CAFÉ TRÊS CORAÇÕES S.A.

Estou ciente quanto às normas e procedimentos descritos nos itens a seguir. Confirmo que li e compreendi todas as regras repassadas quanto ao Gerenciamento de Riscos e me comprometo a cumpri-las em sua totalidade.
Comprometo-me a entregar a carga ao destinatário, em iguais condições em que recebi. Além de, no decorrer do percurso, colher carimbo e assinatura em todos os Postos Fiscais.

Estou ciente que, em caso de descumprimento das normas indicadas neste documento, poderei ser responsabilizado civil e criminalmente pelos danos causados à carga em caso de sinistro, estando eu em desacordo com as regras impostas a mim. Dessa forma, fica a critério do embarcador me bloquear ou não para carregamento através da Central de Gerenciamento de Riscos.

Também estou ciente de que o veículo não pode ser retirado do local de descarga e/ou estacionamento sem autorização da Logística da Filial.`;

      // Preencher os dados automaticamente usando .replace()
      const termoGerado = termoTemplate
        .replace('{nome_motorista}', parsedInfo.motorista || 'NOME_DO_MOTORISTA')
        .replace('{cpf}', parsedInfo.cpf || '000.000.000-00')
        .replace('{cnh}', parsedInfo.cnh || '000000000')
        .replace('{placa}', parsedInfo.cavalo || 'ABC-0000')
        .replace('{data}', parsedInfo.data || new Date().toLocaleDateString('pt-BR'));

      console.log("Termo Gerado com Sucesso:", termoGerado);

      const newId = Math.random().toString(36).substring(2, 9);
      
      // Identifica qual mapa usar com base no destino da planilha
      const destinoInfo = (parsedInfo.destino || "").toUpperCase();
      let searchString = destinoInfo;
      // Se tiver " X ", foca no que vem depois do X (o destino real)
      if (destinoInfo.includes(" X ")) {
        searchString = destinoInfo.split(" X ")[1] || destinoInfo;
      } else if (destinoInfo.includes("|")) {
        // Formato SANTA LUZIA|MG X PINHAIS
        const parts = destinoInfo.split(" X ");
        if (parts.length > 1) searchString = parts[1];
      }

      const sortedKeys = Object.keys(MAPA_REFERENCIA).sort((a, b) => b.length - a.length);
      const nomeArquivoMapa = sortedKeys.find(key => searchString.includes(key));
      const rotaDetectada = nomeArquivoMapa || searchString;
      const mapaArquivo = nomeArquivoMapa ? MAPA_REFERENCIA[nomeArquivoMapa as keyof typeof MAPA_REFERENCIA] : "PADRAO.png";
      
      // Objeto com os dados que você colou da planilha
      const contractData = {
        id: newId,
        data: { 
          ...parsedInfo,
          motorista: parsedInfo.motorista || "NOME_DO_MOTORISTA", // Pegar do seu input/planilha
          placa: parsedInfo.cavalo || "ABC-1234",             // Pegar do seu input/planilha
          cpf: parsedInfo.cpf || "000.000.000-00",          // Pegar do seu input/planilha
          mapa_arquivo: mapaArquivo,
          rota: rotaDetectada,
          status: 'pendente',
          termo_personalizado: termoGerado // SALVANDO O TERMO GERADO COM .REPLACE()
        },
        onbase_status: false,
        created_at: new Date().toISOString()
      };

      // TENTA SALVAR NO CLOUDFLARE WORKER DIRETAMENTE VIA API
      let usedFallback = false;
      try {
        await api.contracts.create(contractData);
      } catch (error) {
        console.log("Fallback Ativado: Gerando link com dados na URL (Base64) devido à ausência de resposta da API do Cloudflare.", error);
        usedFallback = true;
      }

      // Atualiza a lista local temporariamente
      const localContract = {
        id: newId,
        data: contractData.data,
        onbase_status: false,
        created_at: contractData.created_at
      };
      setContracts([localContract as any, ...contracts]);
      
      // GERAR LINK - Falback seguro via Base64 (suporta acentos PT-BR)
      const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(contractData.data))));
      const url = `${window.location.origin}/sign/${newId}?id=${newId}&rota=${encodeURIComponent(rotaDetectada)}&data=${base64Data}`;
      setGeneratedLink(url);
      setParsedData(contractData.data as any);
      
    } catch (error) {
      console.error("Erro inesperado:", error);
      // Removemos o alert de erro para garantir que nunca trave
    } finally {
      setLoading(false);
    }
  };

  // 2. EXCLUIR REGISTRO DO BANCO
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    
    try {
      await api.contracts.delete(id);
      
      // Atualiza a lista na tela imediatamente
      setContracts(contracts.filter(c => c.id !== id));
    } catch (error) {
      console.error("Erro ao deletar na API:", error);
      // Fallback: Remove from UI anyway
      setContracts(contracts.filter(c => c.id !== id));
    }
  };

  // 3. MARCAR SE FOI PARA O ONBASE
  const handleOnbaseToggle = async (id: string, newStatus: boolean) => {
    try {
      await api.contracts.updateOnbase(id, newStatus);
      
      setContracts(contracts.map(c => 
        c.id === id ? { ...c, onbase_status: newStatus } : c
      ));
    } catch (error) {
      console.error("Erro ao atualizar status na API:", error);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateTermContent = (doc: jsPDF, contract: Contract, startY: number, title: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = startY;

    // Header Section with Logo
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    
    // Logo Image
    try {
      doc.addImage(LOGO_3_CORACOES, 'PNG', 19, y + 1.5, 12, 12);
    } catch (e) {
      // Fallback if image fails
      doc.setFillColor(227, 38, 54);
      doc.circle(25, y + 7.5, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.text("3", 24, y + 7, { align: 'center' });
      doc.text("corações", 25, y + 10, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);

    y += 20;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TERMO DE RESPONSABILIDADE GR", pageWidth / 2, y, { align: 'center' });
    y += 8;
    
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    const introText = "Declaro para os devidos fins, que fui contratado(a) pela transportadora, cujos dados seguem abaixo, para efetuar o transporte de carga do embarcador TRÊS CORAÇÕES ALIMENTOS S.A., CAFÉ TRÊS CORAÇÕES S.A.\n\nEstou ciente quanto às normas e procedimentos descritos nos itens a seguir. Confirmo que li e compreendi todas as regras repassadas quanto ao Gerenciamento de Riscos e me comprometo a cumpri-las em sua totalidade.\nComprometo-me a entregar a carga ao destinatário, em iguais condições em que recebi. Além de, no decorrer do percurso, colher carimbo e assinatura em todos os Postos Fiscais.\n\nEstou ciente que, em caso de descumprimento das normas indicadas neste documento, poderei ser responsabilizado civil e criminalmente pelos danos causados à carga em caso de sinistro, estando eu em desacordo com as regras impostas a mim. Dessa forma, fica a critério do embarcador me bloquear ou não para carregamento através da Central de Gerenciamento de Riscos.\n\nTambém estou ciente de que o veículo não pode ser retirado do local de descarga e/ou estacionamento sem autorização da Logística da Filial.";
    const splitIntro = doc.splitTextToSize(introText, 170);
    doc.text(splitIntro, 20, y);
    y += (splitIntro.length * 3.2) + 6;

    // Data Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    // Draw underline for DADOS DA VIAGEM
    doc.text("DADOS DA VIAGEM:", 20, y);
    doc.line(20, y + 1, 52, y + 1);
    y += 5;
    
    doc.setFontSize(7.5);
    const col1 = 20;
    const col2 = 95;
    const col3 = 145;

    doc.setFont("helvetica", "bold");
    doc.text("Data:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(new Date(contract.created_at).toLocaleDateString('pt-BR'), col1 + 10, y);

    doc.setFont("helvetica", "bold");
    doc.text("CPF:", col2, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 255); // Blue for CPF
    doc.text(contract.data.cpf || '-', col2 + 10, y);
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "bold");
    doc.text("Transportadora:", col3, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(contract.data.transportador || '-').substring(0, 25), col3 + 25, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Motorista:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(contract.data.motorista || '-').substring(0, 38), col1 + 16, y);

    doc.setFont("helvetica", "bold");
    doc.text("Vínculo:", col2, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.vinculo || '-', col2 + 14, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Placa Cavalo:", col1, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.cavalo || '-', col1 + 22, y);

    doc.setFont("helvetica", "bold");
    doc.text("Carreta I:", col2, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.carreta || '-', col2 + 16, y);

    doc.setFont("helvetica", "bold");
    doc.text("Carreta II:", col3, y);
    doc.setFont("helvetica", "bold");
    doc.text(contract.data.carreta2 || '-', col3 + 16, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Trajeto:", col1, y);
    doc.setFont("helvetica", "bold");
    const origem = contract.data.origem || 'SANTA LUZIA|MG';
    const destino = contract.data.destino || 'GOV. CELSO RAMOS';
    
    doc.text(origem, col1 + 13, y);
    const origemWidth = doc.getTextWidth(origem);
    
    doc.setDrawColor(0);
    doc.rect(col1 + 15 + origemWidth, y - 3.5, 4, 4);
    doc.setFont("helvetica", "bold");
    doc.text("X", col1 + 16 + origemWidth, y - 0.5);
    
    doc.setFont("helvetica", "bold");
    doc.text(destino, col1 + 21 + origemWidth, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Tecnologia:", col1, y);
    doc.setFont("helvetica", "bold");
    const tecnologia = (contract.data.tecnologia || '-').toUpperCase();
    if (tecnologia.includes('SASCAR')) {
      doc.setTextColor(255, 0, 0); // Red for SASCAR
    }
    doc.text(tecnologia, col1 + 18, y);
    doc.setTextColor(0, 0, 0);

    // Rules Section
    y += 8;    // Check if y is too close to bottom, add page if needed
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const rulesText = `Ao informar início de viagem, deverá aguardar a mensagem **“Ok, Liberado”** que será enviada pela Central de Monitoramento 3corações, autorizando o prosseguimento da viagem;
Informar todas as paradas e reinícios durante a viagem;
Ao chegar no local de descarga, enviar macro **“CHEGADA NO CLIENTE”**, e enviando a macro de **“FIM DE VIAGEM”**, somente quando a descarga for finalizada;
**É proibido parar antes dos 150 km iniciais**, exceto paradas obrigatórias ou problema mecânico/elétrico;
**É proibido pernoite em residência;**
Respeitar o horário de rodagem, no período de **05h00min às 22h00min**;
O veículo será desbloqueado após o pernoite, somente mediante confirmação de senha de segurança do motorista, via teclado;
Evitar pernoite sob cobertura, evitando perda de sinal da antena;
**Não conceder carona;**
Seguir o trajeto predeterminado;
Respeitar o limite de velocidade da via, não excedendo o limite de **80km/h**;
Manter a central informada de todas as anormalidades durante o percurso, mantendo a comunicação, via macro, como também pelos telefones: **Fixo (85) 4006.5522 (escolher a opção desejada); WhatsApp (85) 99198.2886 (apenas mensagem e áudio);**
Dirigir preventivamente, evitando acidentes, preservando sua própria vida, a vida de terceiros e também carga do embarcador;
Não oferecer, dar ou aceitar de quem quer que seja, tanto por conta própria ou através de terceiro, qualquer pagamento, doação, compensação, vantagens ou benefícios de qualquer natureza que constituam prática ilegal ou prática de corrupção sob as leis de qualquer país;
**(Proibido passagem por Sergipe);**
Destino Rio de Janeiro: Agendar escolta com 2 horas de antecedência do ponto de encontro, no pedágio desativado em Duque de Caxias/RJ, evitar rodar depois das 17 horas dentro da área urbana da cidade. Caso necessário, o pernoite acontecerá mais cedo na cidade de Três Rios/RJ (Posto Ipirangão);
Pernoite na BR-381 Rod. Fernão Dias, somente autorizado nos postos Rede Graal e Frango Assado;

**Caso tenha dúvidas, contate nossa central de monitoramento pelos telefones acima informados.**`;

    const renderRichText = (doc: jsPDF, text: string, startX: number, startY: number, maxWidth: number, lineHeight: number) => {
      let currentX = startX;
      let currentY = startY;
      
      const lines = text.split('\n');
      
      lines.forEach((line) => {
        if (line === '') {
          currentY += lineHeight;
          currentX = startX;
          return;
        }

        const parts = line.split(/(\*\*.*?\*\*)/g);
        
        for (const part of parts) {
          if (!part) continue;
          
          const isBold = part.startsWith('**') && part.endsWith('**');
          const content = isBold ? part.slice(2, -2) : part;
          
          doc.setFont("helvetica", isBold ? "bold" : "normal");
          
          const words = content.split(/(\s+)/);
          for (const word of words) {
            if (!word) continue;
            
            const wordWidth = doc.getTextWidth(word);
            
            if (word.trim() === '' && currentX === startX) {
              continue;
            }
            
            if (currentX + wordWidth > startX + maxWidth && word.trim() !== '') {
              currentX = startX;
              currentY += lineHeight;
            }
            
            doc.text(word, currentX, currentY);
            currentX += wordWidth;
          }
        }
        
        currentX = startX;
        currentY += lineHeight;
      });
      
      return currentY;
    };

    y = renderRichText(doc, rulesText, 20, y, 170, 3.2);
    doc.setFont("helvetica", "normal");

    // Footer & Signature
    y += 8;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    // Check if y is too close to bottom, add page if needed
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    const currentDateStr = contract.signed_at 
      ? new Date(contract.signed_at).toLocaleString('pt-BR') 
      : new Date().toLocaleString('pt-BR');
    
    doc.text(`Santa Luzia, ${currentDateStr}`, pageWidth / 2, y, { align: 'center' });
    
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(contract.data.rg || '-', pageWidth / 2, y - 1, { align: 'center' });
    doc.line(60, y, 150, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("(RG do motorista)", pageWidth / 2, y, { align: 'center' });
    
    y += 15;
    if (contract.signature) {
      try {
        // Compact and centered signature
        doc.addImage(contract.signature, 'PNG', pageWidth / 2 - 20, y - 10.5, 40, 10);
      } catch (e) {
        console.error("Failed to add signature to PDF", e);
      }
    }
    doc.line(60, y, 150, y);
    y += 4;
    doc.text("(Assinatura do Motorista)", pageWidth / 2, y, { align: 'center' });
    
    y += 10;
    
    return y + 10;
  };

  const generateChecklistContent = (doc: jsPDF, contract: Contract) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header Table
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.setFillColor(224, 224, 224);

    // Outer border
    doc.rect(10, y, 190, 16);
    // Vertical lines
    doc.line(40, y, 40, y + 16);
    doc.line(140, y, 140, y + 16);
    // Horizontal line in middle and right cols
    doc.line(40, y + 8, 200, y + 8);

    // Fill middle column
    doc.rect(40, y, 100, 8, 'F');
    doc.rect(40, y + 8, 100, 8, 'F');
    // Re-draw lines over fill
    doc.rect(10, y, 190, 16);
    doc.line(40, y, 40, y + 16);
    doc.line(140, y, 140, y + 16);
    doc.line(40, y + 8, 200, y + 8);

    // Logo
    try {
      // Box is x=10 to 40 (width 30), y=y to y+16 (height 16)
      doc.addImage(LOGO_3_CORACOES, 'PNG', 15, y + 1, 20, 14);
    } catch (e) {
      doc.setFillColor(227, 38, 54);
      doc.circle(25, y + 8, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(4);
      doc.setFont("helvetica", "bold");
      doc.text("3", 24, y + 7.5, { align: 'center' });
      doc.text("corações", 25, y + 10.5, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      doc.text("3 Corações", 25, y + 14, { align: 'center' });
    }

    // Middle texts
    doc.setFontSize(9);
    doc.text("CHECK-LIST PRESENCIAL VEICULAR", 105, y + 5.5, { align: 'center' });
    doc.text("GERENCIAMENTO DE RISCOS E SEGUROS", 105, y + 13.5, { align: 'center' });

    // Right texts
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("IMPLANTAÇÃO:", 142, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.text("23/09/2015", 170, y + 5.5);

    doc.setFont("helvetica", "bold");
    doc.text("ATUALIZAÇÃO:", 142, y + 11.5);
    doc.setFont("helvetica", "normal");
    doc.text("01/01/2025", 170, y + 11.5);

    doc.setFont("helvetica", "bold");
    doc.text("VERSÃO 8.1", 142, y + 14.5);
    doc.setFont("helvetica", "normal");
    doc.text("STL", 195, y + 14.5, { align: 'right' });
    y += 16;

    // Section 1: DADOS DO MOTORISTA
    doc.setFillColor(224, 224, 224); // Gray header
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    doc.rect(10, y, 190, 6, 'FD');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO MOTORISTA", 105, y + 4.5, { align: 'center' });
    y += 6;

    doc.rect(10, y, 190, 6);
    doc.setFont("helvetica", "bold");
    doc.text(`MOTORISTA: ${contract.data.motorista || '-'}`, 12, y + 4.5);
    y += 6;

    doc.rect(10, y, 190, 6);
    doc.line(70, y, 70, y + 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    
    // CPF in BLUE
    doc.text("CPF: ", 12, y + 4.5);
    doc.setTextColor(0, 0, 255);
    doc.text(`${contract.data.cpf || '-'}`, 21, y + 4.5);
    doc.setTextColor(0, 0, 0);

    doc.text(`RG: ${contract.data.rg || '-'}`, 72, y + 4.5);
    doc.text(`CNH: ${contract.data.cnh || '-'}`, 132, y + 4.5);
    y += 6;

    doc.rect(10, y, 190, 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`VÍNCULO: ${contract.data.vinculo || '-'}`, 12, y + 4.5);
    y += 6;

    // Section 2: DADOS DO VEÍCULO
    doc.setFillColor(224, 224, 224); // Gray header
    doc.rect(10, y, 190, 6, 'FD');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DADOS DO VEÍCULO", 105, y + 4.5, { align: 'center' });
    y += 6;

    // Transportadora Row
    doc.rect(10, y, 190, 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`Transportadora: ${contract.data.transportador || '-'}`, 12, y + 4.5);
    doc.text("UF DAS PLACAS :", 132, y + 4.5);
    y += 6;

    // Placa Cavalo Row
    doc.rect(10, y, 190, 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`Placa do Cavalo: ${contract.data.cavalo || '-'}`, 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.estado_cavalo || contract.data.uf_placas || '-', 160, y + 4.5);
    y += 6;

    // Placa Carreta 1 Row
    doc.rect(10, y, 190, 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`Placa Carreta: 1 ${contract.data.carreta || '-'}`, 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.estado_carreta || contract.data.uf_placas || '-', 160, y + 4.5);
    y += 6;

    // Placa Carreta 2 Row
    doc.rect(10, y, 190, 6);
    doc.line(130, y, 130, y + 6);
    doc.setFont("helvetica", "bold");
    doc.text(`Placa Carreta: 2 ${contract.data.carreta2 || '-'}`, 12, y + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text(contract.data.uf_placas || '-', 160, y + 4.5);
    y += 6;

    // Vehicle Details Row
    doc.rect(10, y, 190, 6);
    doc.line(75, y, 75, y + 6);
    doc.line(135, y, 135, y + 6);
    
    doc.setFont("helvetica", "bold");
    
    // Check for RED terms in Tipo de Carreta
    const tipoCarreta = (contract.data.modelo_carreta || contract.data.tipo_carreta || '-').toUpperCase();
    doc.text(`Tipo de Carreta: `, 12, y + 4.5);
    if (tipoCarreta.includes('RODOTREM BAÚ')) {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(tipoCarreta, 35, y + 4.5);
    doc.setTextColor(0, 0, 0);
    
    // Check for RED terms in Tipo de cavalo
    const tipoCavalo = (contract.data.modelo_cavalo || contract.data.tipo_cavalo || '-').toUpperCase();
    doc.text(`Tipo de cavalo: `, 77, y + 4.5);
    if (tipoCavalo.includes('TRUCADO')) {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(tipoCavalo, 100, y + 4.5);
    doc.setTextColor(0, 0, 0);

    // Check for RED terms in Tecnologia
    const tecnologia = (contract.data.tecnologia || '-').toUpperCase();
    doc.text(`Tecnologia: `, 137, y + 4.5);
    if (tecnologia.includes('SASCAR')) {
      doc.setTextColor(255, 0, 0);
    }
    doc.text(tecnologia, 155, y + 4.5);
    doc.setTextColor(0, 0, 0);
    y += 6;

    // Section 3: ITENS A SEREM VISTORIADOS
    doc.setFillColor(224, 224, 224); // Gray header
    doc.rect(10, y, 190, 6, 'FD');
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ITENS A SEREM VISTORIADOS - SEGURANÇA PATRIMONIAL", 105, y + 4.5, { align: 'center' });
    y += 6;

    // Table Header
    doc.setFillColor(224, 224, 224);
    doc.rect(10, y, 190, 6, 'FD');
    doc.line(20, y, 20, y + 6);
    doc.line(130, y, 130, y + 6);
    doc.line(145, y, 145, y + 6);
    doc.line(160, y, 160, y + 6);
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("ITEM", 15, y + 4.5, { align: 'center' });
    doc.text("DESCRIÇÃO", 75, y + 4.5, { align: 'center' });
    doc.text("CONF", 137.5, y + 4.5, { align: 'center' });
    doc.text("ÑCON", 152.5, y + 4.5, { align: 'center' });
    doc.text("OBSERVAÇÕES", 175, y + 4.5, { align: 'center' });
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    
    CHECKLIST_ITEMS.forEach((item, idx) => {
      const itemNum = (idx + 1).toString().padStart(2, '0');
      const splitText = doc.splitTextToSize(item, 106);
      const rowHeight = Math.max(splitText.length * 3 + 2, 6);
      
      if (y + rowHeight > 280) {
        doc.addPage();
        y = 15;
      }

      doc.rect(10, y, 190, rowHeight);
      doc.line(20, y, 20, y + rowHeight);
      doc.line(130, y, 130, y + rowHeight);
      doc.line(145, y, 145, y + rowHeight);
      doc.line(160, y, 160, y + rowHeight);
      
      doc.text(itemNum, 15, y + (rowHeight/2) + 1, { align: 'center' });
      doc.text(splitText, 22, y + 4);
      
      // Checkboxes
      doc.setFontSize(8);
      doc.text("[X]", 137.5, y + (rowHeight/2) + 1.5, { align: 'center' });
      doc.text("[  ]", 152.5, y + (rowHeight/2) + 1.5, { align: 'center' });
      doc.setFontSize(6);
      
      // Special observations for items 17 and 18
      if (idx === 16 || idx === 17) {
        doc.setFontSize(5);
        doc.text("ok, não se aplica a baú ou câmara fria", 162, y + (rowHeight/2) + 1);
        doc.setFontSize(6);
      }
      
      y += rowHeight;
    });

    // Bottom Checkboxes
    if (y + 25 > 280) {
      doc.addPage();
      y = 15;
    }

    doc.rect(10, y, 190, 18);
    doc.line(70, y, 70, y + 18);
    doc.line(130, y, 130, y + 18);
    doc.line(10, y + 6, 200, y + 6);
    doc.line(10, y + 12, 200, y + 12);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("[X] POSICIONAMENTO", 12, y + 4.5);
    doc.text("[X] TRAVA DE BAÚ", 72, y + 4.5);
    doc.text("[X] SENSORES PORTA MOTORISTA", 132, y + 4.5);
    
    doc.text("[X] CABO DE ENGATE", 12, y + 10.5);
    doc.text("[X] SIRENE", 72, y + 10.5);
    doc.text("[X] SENSORES PORTA CARONA", 132, y + 10.5);
    
    doc.text("[X] SISTEMA DE BLOQUEIO", 12, y + 16.5);
    doc.text("[X] TECLADO", 72, y + 16.5);
    doc.text("[X] SENSORES DE BAÚ", 132, y + 16.5);
    y += 18;

    // Approval Row
    doc.setFillColor(224, 224, 224);
    doc.rect(10, y, 190, 6);
    doc.rect(10, y, 40, 6, 'F'); // Fill Veiculo Aprovado
    doc.rect(110, y, 20, 6, 'F'); // Fill OBS
    
    doc.line(50, y, 50, y + 6);
    doc.line(80, y, 80, y + 6);
    doc.line(110, y, 110, y + 6);
    doc.line(130, y, 130, y + 6);
    
    doc.setFont("helvetica", "bold");
    doc.text("Veiculo Aprovado", 30, y + 4.5, { align: 'center' });
    doc.text("[X] SIM", 55, y + 4.5);
    doc.text("[ ] NÃO", 85, y + 4.5);
    doc.text("OBS:", 120, y + 4.5, { align: 'center' });
    
    doc.setTextColor(255, 0, 0); // Red text for date
    doc.setFontSize(6);
    doc.text(new Date(contract.signed_at || contract.created_at).toLocaleString('pt-BR'), 160, y + 4.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    // Date Row
    doc.rect(10, y, 190, 6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bolditalic");
    doc.text(new Date(contract.created_at).toLocaleDateString('pt-BR'), 105, y + 4.5, { align: 'center' });
    y += 6;

    // Footer & Signature
    doc.rect(10, y, 190, 25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("ASSINATURA DO MOTORISTA:", 15, y + 12);
    
    if (contract.signature) {
      try {
        // Centered signature
        doc.addImage(contract.signature, 'PNG', 80, y + 2, 60, 20);
      } catch (e) {
        console.error("Failed to add signature to PDF", e);
      }
    }
  };

  const generatePlanoDeTrajetoContent = async (doc: jsPDF, contract: Contract) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header Section (Logo + Title)
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(10, y, 190, 18);
    doc.line(45, y, 45, y + 18);
    
    // Logo Image
    try {
      doc.addImage(LOGO_3_CORACOES, 'PNG', 15, y + 2, 25, 14);
    } catch (e) {
      doc.setFillColor(227, 38, 54);
      doc.circle(27.5, y + 9, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.setFont("helvetica", "bold");
      doc.text("3", 26.5, y + 8.5, { align: 'center' });
      doc.text("corações", 27.5, y + 11.5, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PLANO DE ROTA GERENCIAMENTO DE RISCOS - GR", 122.5, y + 10, { align: 'center' });
    y += 18;

    // Orientations
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text("Orientações sobre o PLANO DE ROTA", 10, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("a. É proibida parada nos primeiros 150 km iniciais, exceto problema mecânico/elétrico;", 10, y);
    y += 3.5;
    doc.text("b. Respeitar o horário de rodagem, no período de 05h00min às 22h00min para produto acabado e 05h00min às 19h00min para o transporte de grãos;", 10, y);
    y += 3.5;
    doc.text("c. Qualquer desvio de trajeto sem prévia autorização é uma falta grave, e poderá ser levada em consideração para futuros carregamentos com a carga da 3corações.", 10, y);
    y += 8;

    // Route Title Bar
    const origem = contract.data.origem || 'Santa Luzia/MG';
    const destino = contract.data.destino || 'Gov. Celso Ramos/SC';
    doc.setFont("helvetica", "bold");
    doc.setFillColor(240, 240, 240);
    doc.rect(10, y, 190, 7, 'F');
    doc.rect(10, y, 190, 7);
    doc.text(`Plano de Rota (${origem} x ${destino})`, pageWidth / 2, y + 5, { align: 'center' });
    y += 7;

    // Map & Itinerary Section
    const mapWidth = 150;
    const itineraryWidth = 40;
    const sectionHeight = 120;

    // Map Area (Left)
    // Draw image first with a slight "zoom" to eliminate white margins
    let mapLoaded = false;
    try {
      const rotaParam = contract.data.rota || destino;
      // Busca dados específicos da rota (documento ID = nome da rota na coleção termos)
      const routeDoc = await api.routes.get(rotaParam.toUpperCase());
      
      const dynamicUrl = routeDoc?.url_mapa || (rotaParam.toUpperCase().includes('NATAL') ? 'https://i.postimg.cc/KcCxBb3N/NATAL.png' : null);

      if (dynamicUrl) {
        const response = await fetch(dynamicUrl);
        if (response.ok) {
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          doc.addImage(base64, 'PNG', 10, y, mapWidth, sectionHeight);
          mapLoaded = true;
        }
      } else if (contract.data.mapa_arquivo) {
        const publicUrl = `/mapas-rotas/${contract.data.mapa_arquivo}`;
        const response = await fetch(publicUrl);
        if (response.ok) {
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          // Zoom in by drawing slightly larger and offset
          doc.addImage(base64, 'PNG', 10 - 5, y - 5, mapWidth + 10, sectionHeight + 10);
          mapLoaded = true;
        }
      }
    } catch (e) {
      console.error("Erro ao carregar mapa para o PDF:", e);
    }

    // Draw white rectangles around the map area to "mask" the zoom overflow
    doc.setFillColor(255, 255, 255);
    doc.rect(0, y - 10, 210, 10, 'F'); // Top mask
    doc.rect(0, y + sectionHeight, 210, 50, 'F'); // Bottom mask
    doc.rect(0, y, 10, sectionHeight, 'F'); // Left mask
    doc.rect(10 + mapWidth, y, 60, sectionHeight, 'F'); // Right mask (covers itinerary area temporarily)

    // Re-draw borders for the map area
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(10, y, mapWidth, sectionHeight);

    if (!mapLoaded) {
      doc.setFontSize(10);
      doc.text("MAPA DE TRAJETO", 10 + mapWidth / 2, y + sectionHeight / 2, { align: 'center' });
      doc.setFontSize(7);
      doc.text("(Visualização do mapa indisponível)", 10 + mapWidth / 2, y + sectionHeight / 2 + 5, { align: 'center' });
    }

    // Itinerary Table (Right)
    doc.rect(10 + mapWidth, y, itineraryWidth, sectionHeight);
    doc.setFillColor(240, 240, 240);
    doc.rect(10 + mapWidth, y, itineraryWidth, 6, 'F');
    doc.rect(10 + mapWidth, y, itineraryWidth, 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("Cidades do Itinerário :", 10 + mapWidth + itineraryWidth / 2, y + 4, { align: 'center' });
    
    const trajetoRaw = contract.data.trajeto || "";
    const cities = trajetoRaw 
      ? trajetoRaw.split(/[;|\n]+/).map(city => `» ${city.trim()}`).filter(city => city.length > 2)
      : getCitiesForDestination(destino, origem).map(city => `» ${city}`);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    let itY = y + 10;
    cities.slice(0, 20).forEach(city => {
      doc.text(city, 10 + mapWidth + 2, itY);
      doc.line(10 + mapWidth, itY + 1, 10 + mapWidth + itineraryWidth, itY + 1);
      itY += 4.5;
    });
    
    // Fill remaining lines for table look
    while (itY < y + sectionHeight) {
      doc.line(10 + mapWidth, itY + 1, 10 + mapWidth + itineraryWidth, itY + 1);
      itY += 4.5;
    }

    y += sectionHeight + 5;

    // Forbidden Stops Section
    doc.setFillColor(240, 240, 240);
    doc.rect(10, y, 190, 7, 'F');
    doc.rect(10, y, 190, 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("PARADAS PROIBIDAS", pageWidth / 2, y + 5, { align: 'center' });
    y += 7;

    const forbiddenInfo = getForbiddenStopsForDestination(destino);
    const forbiddenStops = [];
    for (let i = 0; i < forbiddenInfo.stops.length; i += 3) {
      forbiddenStops.push([
        forbiddenInfo.stops[i] || "",
        forbiddenInfo.stops[i + 1] || "",
        forbiddenInfo.stops[i + 2] || ""
      ]);
    }

    doc.setFontSize(7);
    forbiddenStops.forEach(row => {
      doc.rect(10, y, 63.3, 6);
      doc.rect(73.3, y, 63.3, 6);
      doc.rect(136.6, y, 63.3, 6);
      doc.setFont("helvetica", "normal");
      doc.text(row[0], 12, y + 4.5);
      doc.text(row[1], 75.3, y + 4.5);
      doc.text(row[2], 138.6, y + 4.5);
      y += 6;
    });

    if (forbiddenInfo.overnight) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`LUGARES PERMITIDOS PARA PERNOITE: ${forbiddenInfo.overnight}`, pageWidth / 2, y + 4, { align: 'center' });
      y += 6;
    }

    y += 10;

    // Bottom Data Table
    doc.setFillColor(240, 240, 240);
    doc.rect(10, y, 190, 7, 'F');
    doc.rect(10, y, 190, 7);
    doc.setFontSize(8.5);
    doc.text("DADOS DA VIAGEM", pageWidth / 2, y + 5, { align: 'center' });
    y += 7;

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    
    // Row 1
    doc.rect(10, y, 28, 6); doc.text("Data:", 11, y + 4); doc.setFont("helvetica", "normal"); doc.text(new Date(contract.created_at).toLocaleDateString('pt-BR'), 19, y + 4);
    doc.rect(38, y, 38, 6); doc.setFont("helvetica", "bold"); doc.text("CPF:", 39, y + 4); doc.setFont("helvetica", "normal"); doc.text(contract.data.cpf || '-', 46, y + 4);
    doc.rect(76, y, 44, 6); doc.setFont("helvetica", "bold"); doc.text("Nome:", 77, y + 4); doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.text(String(contract.data.motorista || '-').substring(0, 25), 86, y + 4); doc.setFontSize(7);
    doc.rect(120, y, 40, 6); doc.setFont("helvetica", "bold"); doc.text("Carreta 1:", 121, y + 4); doc.setFont("helvetica", "normal"); doc.text(contract.data.carreta || '-', 134, y + 4);
    doc.rect(160, y, 40, 6); doc.setFont("helvetica", "bold"); doc.text("Carreta 2:", 161, y + 4); doc.setFont("helvetica", "normal"); doc.text(contract.data.carreta2 || '-', 174, y + 4);
    y += 6;

    // Row 2
    doc.rect(10, y, 45, 6); doc.setFont("helvetica", "bold"); doc.text("Transp:", 11, y + 4); doc.setFont("helvetica", "normal"); doc.setFontSize(6); doc.text(String(contract.data.transportador || '-').substring(0, 25), 21, y + 4); doc.setFontSize(7);
    doc.rect(55, y, 35, 6); doc.setFont("helvetica", "bold"); doc.text("Cavalo:", 56, y + 4); doc.setFont("helvetica", "normal"); doc.text(contract.data.cavalo || '-', 66, y + 4);
    doc.rect(90, y, 35, 6); doc.setFont("helvetica", "bold"); doc.text("Destino:", 91, y + 4); doc.setFont("helvetica", "normal"); doc.text(String(destino).substring(0, 15), 102, y + 4);
    doc.rect(125, y, 75, 12); doc.setFont("helvetica", "bold"); doc.text("Assinatura:", 126, y + 4);
    
    // Row 3 (partial)
    doc.rect(10, y + 6, 45, 6); doc.setFont("helvetica", "bold"); doc.text("Tecnologia:", 11, y + 10); doc.setFont("helvetica", "normal"); doc.text(String(contract.data.tecnologia || '-').substring(0, 15), 26, y + 10);
    doc.rect(55, y + 6, 70, 6);
    
    if (contract.signature) {
      try {
        doc.addImage(contract.signature, 'PNG', 135, y + 1, 50, 10);
      } catch (e) {
        console.error("Failed to add signature to Plano de Rota", e);
      }
    }
    
    y += 12;

    return y + 10;
  };

  const downloadPDF = async (originalContract: Contract) => {
    setLoading(true);
    let contract = originalContract;
    
    try {
      // Busca dados mais recentes do Firestore para garantir que a assinatura e status estejam ok
      const latestContract = await api.contracts.get(originalContract.id);
      if (latestContract) {
        contract = latestContract;
      }
    } catch (e) {
      console.warn("Usando dados do cache para PDF pois falhou busca remota", e);
    }

    const doc = new jsPDF();
    
    const transportadora = (contract.data.transportador || '').toUpperCase();
    
    const checklistOnlyTransportadoras = [
      'TOMASI',
      'TRANSMAGNA',
      'GOBOR',
      'APK',
      'GT MINAS',
      'UNITRADING LOG',
      'MODERN LOGISTICS',
      'RGS TRANSPORTES',
      'JRL TRANSPORTES',
      'JRL TRANSPORTES.'
    ];

    const allThreeTransportadoras = [
      'SRH SARAIVA',
      'MOEDENSE',
      'RNCGG',
      'FASI',
      'TRANSPORTES VIVAN',
      'COMBOIO',
      'LEDIFRAN',
      'TORNADO'
    ];

    const isChecklistOnly = checklistOnlyTransportadoras.some(t => transportadora.includes(t));
    const isAllThree = allThreeTransportadoras.some(t => transportadora.includes(t));

    if (isChecklistOnly && !isAllThree) {
      // Only Checklist
      generateChecklistContent(doc, contract);
    } else {
      // All three documents (default behavior or explicitly requested)
      // Page 1: Termo de Responsabilidade (Via Única)
      generateTermContent(doc, contract, 15, "VIA ÚNICA / ARQUIVO");

      // Page 2: Plano de Rota
      doc.addPage();
      await generatePlanoDeTrajetoContent(doc, contract);

      // Page 3: Checklist
      doc.addPage();
      generateChecklistContent(doc, contract);
    }

    doc.save(`documentos_gr_${contract.data.motorista || contract.id}.pdf`);
    setLoading(false);
  };

  const stats = [
    { name: 'Assinados', value: contracts.filter(c => c.data.status === 'assinado').length, color: '#10b981' },
    { name: 'Pendentes', value: contracts.filter(c => c.data.status === 'pendente' || !c.data.status).length, color: '#f59e0b' },
  ];

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.data.motorista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.data.cpf?.includes(searchTerm) ||
      c.data.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.data.cavalo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.data.carreta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'signed' && c.data.status === 'assinado') ||
      (statusFilter === 'pending' && (c.data.status === 'pendente' || !c.data.status));
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-red-500/30">
      {/* Modern Sidebar/Nav Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] text-white p-6 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/50 to-slate-900/90 z-0"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 overflow-hidden border border-red-400/30">
                <img src={LOGO_3_CORACOES} alt="3 Corações" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AssinaGR</h1>
                <p className="text-[10px] text-red-400 uppercase tracking-widest font-semibold">Assinatura Digital</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              <button 
                onClick={() => setActiveTab('generate')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'generate' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Clipboard className="w-5 h-5" />
                Importar Dados
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <History className="w-5 h-5" />
                Histórico de Termos
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Painel de Controle
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Settings className="w-5 h-5" />
                Configurações
              </button>
              <button 
                onClick={() => setActiveTab('idealizador')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'idealizador' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Info className="w-5 h-5" />
                Idealizador
              </button>
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-red-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-300">Dica de Segurança</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={currentPhraseIndex}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-xs text-slate-400 italic leading-relaxed"
                  >
                    "{SECURITY_PHRASES[currentPhraseIndex]}"
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 lg:p-8 overflow-y-auto bg-slate-50/50 relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-red-50/50 to-transparent -z-10"></div>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
            <div>
              <h2 className="text-xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Painel de Controle' : activeTab === 'generate' ? 'Importar Dados' : activeTab === 'settings' ? 'Configurações do GR' : activeTab === 'idealizador' ? 'Idealizador' : 'Histórico de Termos'}
              </h2>
              <p className="text-slate-500 text-xs lg:text-sm mt-1">
                {activeTab === 'dashboard' ? 'Visão geral das assinaturas e operações.' : activeTab === 'generate' ? 'Processe os dados da planilha para criar um link de assinatura.' : activeTab === 'settings' ? 'Ajuste os termos, orientações e coordenadas do mapa.' : activeTab === 'idealizador' ? 'Sobre a criação do aplicativo e nossa visão.' : 'Acompanhe e gerencie todos os termos emitidos.'}
              </p>
            </div>
            
            {activeTab !== 'generate' && (
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {contracts.slice(0, 3).map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {c.data.motorista?.[0] || 'M'}
                    </div>
                  ))}
                  {contracts.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-red-600">
                      +{contracts.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
              >
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-red-600" />
                  Configurações Globais
                </h3>

                {termsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-red-600" />
                    <p className="text-slate-400 font-medium">Carregando configurações...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Latitude do Mapa (Default)</label>
                        <input 
                          type="text"
                          value={termsData?.latitude || ''}
                          onChange={(e) => setTermsData({...termsData, latitude: e.target.value})}
                          placeholder="-19.6205842"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Longitude do Mapa (Default)</label>
                        <input 
                          type="text"
                          value={termsData?.longitude || ''}
                          onChange={(e) => setTermsData({...termsData, longitude: e.target.value})}
                          placeholder="-43.9002578"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Orientações de Rota (Aparece no Mapa)</label>
                      <textarea 
                        value={termsData?.orientacoes_rota || ''}
                        onChange={(e) => setTermsData({...termsData, orientacoes_rota: e.target.value})}
                        placeholder="Insira as regras para o motorista..."
                        rows={6}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleSaveTerms}
                        disabled={saveLoading}
                        className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/20"
                      >
                        {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Salvar Configurações
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Cards - Ocultos conforme solicitado */}
                {/* 
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Total de Termos</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Assinados</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.filter(c => c.signature).length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Pendentes</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.filter(c => !c.signature).length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">No OnBase</p>
                      <p className="text-2xl font-bold text-slate-900">{contracts.filter(c => c.onbase_status).length}</p>
                    </div>
                  </div>
                </div>
                */}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Termos Gerados (Últimos 7 dias)</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Status das Assinaturas</h3>
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Assinados', value: contracts.filter(c => c.signature).length, color: '#10b981' },
                              { name: 'Pendentes', value: contracts.filter(c => !c.signature).length, color: '#f59e0b' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {
                              [
                                { name: 'Assinados', value: contracts.filter(c => c.signature).length, color: '#10b981' },
                                { name: 'Pendentes', value: contracts.filter(c => !c.signature).length, color: '#f59e0b' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))
                            }
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'generate' ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-8"
              >
                {/* Input Section */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Clipboard className="w-5 h-5 text-red-600" />
                      </div>
                      <h3 className="font-bold text-slate-800">Importar Dados</h3>
                    </div>
                    
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Cole aqui a linha copiada da planilha (Motorista, CPF, Placa, Trajeto...)"
                      className="w-full h-32 lg:h-40 p-3 lg:p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none mb-4"
                    />
                    
                    <button
                      onClick={handleGenerateAndSave}
                      disabled={loading || !inputText.trim()}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <Truck className="w-5 h-5" />
                          Processar e Gerar Link
                        </>
                      )}
                    </button>
                  </div>

                  {parsedData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h3 className="font-bold text-slate-800">Dados Extraídos</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Motorista</span>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-700">{parsedData.motorista || '-'}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF</span>
                          <p className="text-sm font-semibold text-slate-700">{parsedData.cpf || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placa</span>
                          <div className="flex items-center gap-2">
                            <Truck className="w-3 h-3 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-700">{parsedData.cavalo || '-'}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transportadora</span>
                          <p className="text-sm font-semibold text-slate-700 truncate">{parsedData.transportador || '-'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trajeto</span>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-700 truncate">{parsedData.trajeto || getCitiesForDestination(parsedData.destino || '', parsedData.origem || '').join(', ')}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tecnologia</span>
                          <p className="text-sm font-semibold text-slate-700">{parsedData.tecnologia || '-'}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {generatedLink && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <LinkIcon size={20} className="text-orange-500" /> Link de Assinatura
                    </h3>

                    <div className="flex items-center w-full border rounded p-2 bg-gray-50 mb-4">
                      <input 
                        className="bg-transparent flex-1 outline-none text-sm text-gray-500" 
                        value={generatedLink} 
                        readOnly 
                      />
                      <button onClick={copyToClipboard} className="p-1 hover:bg-gray-200 rounded">
                        {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <div className="flex justify-center p-4 bg-white border rounded-xl mb-4">
                      {/* Aqui usamos o componente que você já importou */}
                      <QRCodeSVG value={generatedLink} size={150} />
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm text-slate-700 space-y-3">
                      <p>Olá! Informamos que a vistoria técnica do seu veículo foi concluída com sucesso (Tudo OK). ✅</p>
                      <p>Para prosseguir, por favor, acesse o link abaixo para ler os termos de responsabilidade e realizar a sua assinatura digital.</p>
                      <p>Link: <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-red-600 font-medium break-all">{generatedLink}</a></p>
                      <p className="font-medium">Importante: Após a sua assinatura, nosso sistema validará a disponibilidade final do veículo para liberação.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : activeTab === 'idealizador' ? (
              <motion.div
                key="idealizador"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Hero Section */}
                  <div className="lg:col-span-12 bg-slate-900 rounded-3xl p-8 lg:p-12 relative overflow-hidden border border-slate-800 shadow-2xl">
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold uppercase tracking-widest mb-6">
                          <ShieldCheck className="w-4 h-4" />
                          Inovação em Logística
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
                          A Revolução na <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-400">Gestão de Riscos</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                          Nossa visão foi criar uma plataforma 100% digital, intuitiva e à prova de fraudes. Eliminando a burocracia e elevando o padrão de segurança da nossa logística.
                        </p>
                      </div>
                      <div className="w-32 h-32 lg:w-48 lg:h-48 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl shrink-0 p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <img src={LOGO_3_CORACOES} alt="3 Corações" className="w-full h-full object-contain filter drop-shadow-lg" />
                      </div>
                    </div>
                  </div>

                  {/* Content Bento Grid */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <Info className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Nossa Missão</h3>
                    </div>
                    <div className="space-y-6 text-slate-600 leading-relaxed">
                      <p>
                        O <strong>AssinaGR</strong> nasceu da necessidade de transformar a maneira como lidamos com a segurança e a conformidade no transporte de cargas. Em um cenário logístico cada vez mais dinâmico e exigente, percebemos que os processos tradicionais em papel não apenas atrasavam as operações, mas também abriam margem para falhas de segurança e perda de informações críticas.
                      </p>
                      <p>
                        Com a implementação da assinatura digital criptografada e a geração automatizada de Termos de Responsabilidade e Planos de Trajeto, o AssinaGR garante que todas as normas de Gerenciamento de Risco sejam rigorosamente documentadas e arquivadas.
                      </p>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-l-4 border-l-red-500">
                        <p className="text-slate-700 font-medium italic">
                          "Isso não é apenas uma melhoria de processo; é uma mudança de paradigma. Estamos protegendo nossos colaboradores, nossas cargas e garantindo a excelência que a marca 3 Corações representa."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Credits Sidebar */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-slate-700 shadow-lg text-white flex-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <User className="w-32 h-32" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full">
                        <div>
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Criador e Idealizador</p>
                          <h3 className="text-2xl font-bold text-white mb-1">Jefferson Augusto</h3>
                          <p className="text-xs text-slate-400 font-medium">Unidade - Santa Luzia</p>
                          <p className="text-xs text-slate-400 font-medium italic">Agente de Risco</p>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-start justify-end mt-8">
                          <div className="w-px h-16 bg-gradient-to-b from-red-500/50 to-transparent mb-4 ml-3"></div>
                          <div className="p-2 rounded-full bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm shadow-inner">
                            <Coffee className="w-5 h-5 text-amber-500" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <History className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data de Lançamento</p>
                          <p className="font-bold text-slate-700">26 de Março, 2026</p>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-red-50 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {label: 'Total de Termos', value: contracts.length, icon: FileText, color: 'red', filter: 'all' },
                    {label: 'Assinados', value: contracts.filter(c => c.data.status === 'assinado').length, icon: CheckCircle2, color: 'emerald', filter: 'signed' },
                    {label: 'Pendentes', value: contracts.filter(c => c.data.status === 'pendente' || !c.data.status).length, icon: Clock, color: 'amber', filter: 'pending' },
                    {label: 'Taxa de Sucesso', value: `${contracts.length ? Math.round((contracts.filter(c => c.data.status === 'assinado').length / contracts.length) * 100) : 0}%`, icon: ShieldCheck, color: 'red', filter: 'all' },
                  ].map((stat, i) => (
                    <button 
                      key={i} 
                      onClick={() => setStatusFilter(stat.filter as any)}
                      className={`bg-white rounded-2xl p-6 shadow-sm border text-left flex items-center gap-4 transition-all ${
                        statusFilter === stat.filter 
                          ? 'border-red-500 ring-2 ring-red-500/10' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-3 bg-${stat.color}-50 rounded-xl`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Search className="w-5 h-5 text-slate-500" />
                      </div>
                      <h3 className="font-bold text-slate-800">Filtrar Registros</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                      <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Buscar por Motorista, Placa ou CPF..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                      </div>
                      <button 
                        onClick={fetchHistory}
                        disabled={historyLoading}
                        className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {historyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4" />}
                        Atualizar
                      </button>
                    </div>
                  </div>

                  <div className="w-full">
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                            <th className="px-6 py-4">Motorista / ID</th>
                            <th className="px-6 py-4">CPF / Placa</th>
                            <th className="px-6 py-4">Data de Emissão</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {historyLoading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-200" />
                              </td>
                            </tr>
                          ) : filteredContracts.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                Nenhum registro encontrado para sua busca.
                              </td>
                            </tr>
                          ) : (
                            filteredContracts.map((contract) => (
                              <React.Fragment key={contract.id}>
                                <tr className="group hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => setExpandedRow(expandedRow === contract.id ? null : contract.id)}>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">
                                        {contract.data.motorista?.[0] || 'M'}
                                      </div>
                                      <div>
                                        <div className="font-bold text-sm text-slate-700">{contract.data.motorista || 'N/A'}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{contract.id}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-600">{contract.data.cpf || '-'}</div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Truck className="w-3 h-3" />
                                      {contract.data.cavalo || '-'}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-sm text-slate-600">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-300" />
                                        {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(contract.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {contract.data.status === 'assinado' ? (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Assinado
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase">
                                        <Clock className="w-3 h-3" />
                                        Pendente
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        onClick={() => {
                                          const link = `${window.location.origin}/sign/${contract.id}`;
                                          navigator.clipboard.writeText(link);
                                          alert("Link copiado!");
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Copiar Link"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => downloadPDF(contract)}
                                        disabled={!contract.signature || contract.data?.status !== 'assinado'}
                                        className={`p-2 transition-all rounded-lg ${
                                          (!contract.signature || contract.data?.status !== 'assinado') 
                                            ? 'text-slate-200 cursor-not-allowed text-opacity-30' 
                                            : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                        }`}
                                        title={(!contract.signature || contract.data?.status !== 'assinado') ? "Aguardando assinatura concluir" : "Baixar PDF Duplo"}
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(contract.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title="Excluir Registro"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setExpandedRow(expandedRow === contract.id ? null : contract.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      >
                                        {expandedRow === contract.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                {expandedRow === contract.id && (
                                  <tr className="bg-slate-50 border-b border-slate-100">
                                    <td colSpan={5} className="px-6 py-6">
                                      <div className="flex flex-col md:flex-row gap-8">
                                        {/* Link & QR Code Section */}
                                        <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4" />
                                            Acesso do Motorista
                                          </h4>
                                          <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                              <QRCodeSVG value={`${window.location.origin}/sign/${contract.id}`} size={100} level="H" />
                                            </div>
                                            <div className="flex-1 w-full">
                                              <p className="text-xs text-slate-500 mb-2">Link direto para assinatura:</p>
                                              <div className="flex items-center gap-2">
                                                <input 
                                                  type="text" 
                                                  readOnly 
                                                  value={`${window.location.origin}/sign/${contract.id}`}
                                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
                                                />
                                                <button 
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/sign/${contract.id}`);
                                                    alert("Link copiado!");
                                                  }}
                                                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                  <Copy className="w-4 h-4" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Onbase Toggle Section */}
                                        <div className="flex-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Clipboard className="w-4 h-4" />
                                            Controle Interno
                                          </h4>
                                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                            <div>
                                              <p className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-1">Baixa no Onbase?</p>
                                              <p className="text-[10px] text-slate-500">O documento foi processado no sistema?</p>
                                            </div>
                                            <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                              <button
                                                onClick={() => handleOnbaseToggle(contract.id, false)}
                                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${!contract.onbase_status ? 'bg-red-500 text-white shadow-md shadow-red-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                                              >
                                                NÃO
                                              </button>
                                              <button
                                                onClick={() => handleOnbaseToggle(contract.id, true)}
                                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${contract.onbase_status ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                                              >
                                                SIM
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden flex flex-col gap-4">
                      {historyLoading ? (
                        <div className="py-12 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-200" />
                        </div>
                      ) : filteredContracts.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 italic text-sm">
                          Nenhum registro encontrado para sua busca.
                        </div>
                      ) : (
                        filteredContracts.map((contract) => (
                          <div key={contract.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                            <div 
                              className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => setExpandedRow(expandedRow === contract.id ? null : contract.id)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-600 font-bold text-[10px] shrink-0">
                                    {contract.data.motorista?.[0] || 'M'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-xs text-slate-700 truncate">{contract.data.motorista || 'N/A'}</div>
                                    <div className="text-[9px] text-slate-400 font-mono truncate">{contract.id}</div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {contract.signature ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-bold uppercase">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      Assinado
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[8px] font-bold uppercase">
                                      <Clock className="w-2.5 h-2.5" />
                                      Pendente
                                    </span>
                                  )}
                                  {contract.onbase_status && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full text-[8px] font-bold uppercase">
                                      Onbase OK
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">CPF</div>
                                  <div className="text-[10px] font-medium text-slate-600 truncate">{contract.data.cpf || '-'}</div>
                                </div>
                                <div>
                                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">Placa</div>
                                  <div className="text-[10px] font-medium text-slate-600 truncate flex items-center gap-1">
                                    <Truck className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{contract.data.cavalo || '-'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(contract.created_at).toLocaleDateString('pt-BR')}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(contract.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5 text-red-600 font-medium">
                                  {expandedRow === contract.id ? 'Menos' : 'Mais'}
                                  {expandedRow === contract.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Expanded Content */}
                            {expandedRow === contract.id && (
                              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const link = `${window.location.origin}/sign/${contract.id}`;
                                      navigator.clipboard.writeText(link);
                                      alert("Link copiado!");
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
                                  >
                                    <Copy className="w-4 h-4" />
                                    Copiar
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadPDF(contract);
                                    }}
                                    disabled={!contract.signature || contract.data?.status !== 'assinado'}
                                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${
                                      (!contract.signature || contract.data?.status !== 'assinado')
                                        ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                                        : 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100'
                                    }`}
                                  >
                                    <Download className="w-4 h-4" />
                                    PDF
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(contract.id);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                  </button>
                                </div>

                                {/* Link & QR Code Section */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" />
                                    Acesso do Motorista
                                  </h4>
                                  <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                      <QRCodeSVG value={`${window.location.origin}/sign/${contract.id}`} size={120} level="H" />
                                    </div>
                                    <div className="w-full">
                                      <p className="text-[10px] text-slate-500 mb-1.5">Link direto:</p>
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="text" 
                                          readOnly 
                                          value={`${window.location.origin}/sign/${contract.id}`}
                                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Onbase Toggle Section */}
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clipboard className="w-4 h-4" />
                                    Controle Interno
                                  </h4>
                                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                      <p className="font-bold text-[10px] text-slate-700 uppercase tracking-wider">Baixa no Onbase?</p>
                                    </div>
                                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOnbaseToggle(contract.id, false);
                                        }}
                                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${!contract.onbase_status ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400'}`}
                                      >
                                        NÃO
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOnbaseToggle(contract.id, true);
                                        }}
                                        className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${contract.onbase_status ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400'}`}
                                      >
                                        SIM
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
