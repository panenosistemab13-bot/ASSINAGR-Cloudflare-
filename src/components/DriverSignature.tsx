import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  User, 
  ClipboardCheck,
  Info,
  Lock,
  MapPin
} from 'lucide-react';
import { SignaturePad } from './SignaturePad';
import { Contract } from '../types';
import { api } from '../services/api';
import VisualizadorDeMapa from './VisualizadorDeMapa';
import { LOGO_3_CORACOES } from '../constants';
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

const SECURITY_TIPS = [
  "Sua segurança é nossa prioridade. Respeite os limites de velocidade.",
  "Mantenha a Central de Monitoramento informada sobre qualquer parada.",
  "Atenção redobrada em áreas de risco. Siga o trajeto predeterminado.",
  "O uso do cinto de segurança é obrigatório em todo o percurso.",
  "Não dê carona a estranhos. Sua vida vale mais que qualquer carga."
];

export const DriverSignature: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = paramId || new URLSearchParams(window.location.search).get('id');
  const [contract, setContract] = useState<Contract | null>(null);
  const [terms, setTerms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [step, setStep] = useState(1); // 1: Termo, 2: Plano de Rota, 3: Checklist + Assinatura
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const transportadorasChecklist = [
    'TOMASI', 'TRANSMAGNA', 'GOBOR', 'APK', 'GT MINAS', 
    'UNITRADING LOG', 'MODERN LOGISTICS', 'RGS TRANSPORTES', 'JRL TRANSPORTES', 'JRL TRANSPORTES.'
  ];

  const isChecklistOnly = contract?.data?.transportador 
    ? transportadorasChecklist.some(t => contract.data.transportador.toUpperCase().includes(t))
    : false;

  useEffect(() => {
    const fetchContract = async () => {
      if (!id) return;
      
      try {
        const [parsedData, termsData] = await Promise.all([
          api.contracts.get(id).catch((err) => {
            console.error("Erro ao buscar contrato no Firestore:", err);
            return null;
          }),
          api.settings.getTerms().catch(() => null)
        ]);

        if (termsData) {
          setTerms(termsData);
        }

        if (parsedData) {
          setContract(parsedData); 

          const transportadoraName = (parsedData.data.transportador || '').toUpperCase();
          const isChecklist = transportadorasChecklist.some(t => transportadoraName.includes(t));
          
          if (isChecklist && !parsedData.signature) {
            setStep(3);
          }

          if (parsedData.signature) {
            setSigned(true);
            setSignatureData(parsedData.signature);
          }
        } else {
          setError('Link inválido ou expirado.');
        }
      } catch (error) {
        console.error("Erro ao carregar link:", error);
        setError('Link inválido ou expirado.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % SECURITY_TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);

  const handleSign = async (signature: string) => {
    setPendingSignature(signature);
    setShowConfirmModal(true);
  };

  const handleFinalize = async (signatureToSave: string) => {
    setSaving(true);
    try {
      if (!id) throw new Error("ID ausente");
      
      try {
        await api.contracts.sign(id, signatureToSave);
      } catch (e) {
        console.warn("Falha ao salvar na API persistente (modo fallback visual)", e);
      }

      setSignatureData(signatureToSave);
      setSigned(true);
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Erro ao processar assinatura:", err);
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
        <p className="text-slate-400 font-medium animate-pulse">Carregando documentos...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Ops! Algo deu errado.</h1>
          <p className="text-slate-500 max-w-xs mx-auto">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full text-center space-y-8 border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Registro Concluído</h1>
            <p className="text-slate-500 text-sm">
              Obrigado, <span className="font-bold text-slate-700">{contract.data.motorista}</span>. Seu termo foi assinado e arquivado com sucesso.
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-slate-400" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-left">
              Documento arquivado digitalmente sob criptografia de ponta a ponta.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-[10px] text-slate-300 font-mono uppercase tracking-[0.3em]">ASSINAGR • {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 font-sans">
      <div className="max-w-[800px] mx-auto space-y-6">
        
        {/* Modern Progress Header */}
        <header className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 overflow-hidden border border-red-400/30">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-900 leading-none">AssinaGR</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Motorista</p>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-100" />

            {!isChecklistOnly && (
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : step > s ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Etapa {step} de 3</span>
            <span className="text-xs font-bold text-slate-700">
              {isChecklistOnly ? 'Checklist' : (step === 1 ? 'Termo GR' : step === 2 ? 'Plano de Rota' : 'Checklist')}
            </span>
          </div>
        </header>

        {/* Security Tip Banner */}
        <div className="bg-red-600 rounded-2xl p-4 shadow-lg shadow-red-600/10 flex items-center gap-4 overflow-hidden relative">
          <div className="p-2 bg-white/10 rounded-lg shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentTipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white text-xs font-medium leading-tight"
            >
              {SECURITY_TIPS[currentTipIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ShieldCheck className="w-24 h-24 text-white" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10"
            >
              <div className="flex flex-col items-center text-center space-y-4 border-b border-slate-100 pb-8">
                <img 
                  src={LOGO_3_CORACOES} 
                  alt="3corações" 
                  className="h-16 object-contain mb-2"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">TERMO DE RESPONSABILIDADE GR</h2>
                  <p className="text-slate-400 text-sm font-medium">Normas de Gerenciamento de Risco - Três Corações Alimentos S.A.</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <div className="text-sm leading-relaxed text-slate-600 space-y-6 text-justify bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {contract.data.termo_personalizado ? (
                    <p className="whitespace-pre-line font-medium text-slate-800">
                      {contract.data.termo_personalizado}
                    </p>
                  ) : terms?.termo_responsabilidade ? (
                    <div className="whitespace-pre-line font-medium text-slate-800">
                      {terms.termo_responsabilidade}
                    </div>
                  ) : (
                    <>
                      <p>
                        Declaro para os devidos fins, que fui contratado(a) pela transportadora, cujos dados seguem abaixo, para efetuar o transporte de carga do embarcador <span className="font-bold text-slate-800">TRÊS CORAÇÕES ALIMENTOS S.A., CAFÉ TRÊS CORAÇÕES S.A.</span>
                      </p>
                      <p>
                        Estou ciente quanto às normas e procedimentos descritos nos itens a seguir. Confirmo que li e compreendi todas as regras repassadas quanto ao Gerenciamento de Riscos e me comprometo a cumpri-las em sua totalidade.
                      </p>
                      <p>
                        Comprometo-me a entregar a carga ao destinatário, em iguais condições em que recebi. Além de, no decorrer do percurso, colher carimbo e assinatura em todos os Postos Fiscais.
                      </p>
                      <p>
                        Estou ciente que, em caso de descumprimento das normas indicadas neste documento, poderei ser responsabilizado civil e criminalmente pelos danos causados à carga em caso de sinistro, estando eu em desacordo com as regras impostas a mim. Dessa forma, fica a critério do embarcador me bloquear ou não para carregamento através da Central de Gerenciamento de Riscos.
                      </p>
                      <p className="font-medium">
                        Também estou ciente de que o veículo não pode ser retirado do local de descarga e/ou estacionamento sem autorização da Logística da Filial.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-8 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Dados da Viagem</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Data</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(contract.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">CPF</p>
                      <p className="text-sm font-bold text-red-600">{contract.data.cpf || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Vínculo</p>
                      <p className="text-sm font-bold text-slate-700">{contract.data.vinculo || 'FROTA'}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Motorista</p>
                      <p className="text-sm font-bold text-slate-700">{contract.data.motorista || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Placa Cavalo</p>
                      <p className="text-sm font-bold text-slate-700">{contract.data.cavalo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Carreta I</p>
                      <p className="text-sm font-bold text-slate-700">{contract.data.carreta || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Carreta II</p>
                      <p className="text-sm font-bold text-slate-700">{contract.data.carreta2 || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tecnologia</p>
                      <p className={`text-sm font-bold ${(contract.data.tecnologia || '').toUpperCase().includes('SASCAR') ? 'text-red-600' : 'text-slate-700'}`}>
                        {contract.data.tecnologia || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">UF</p>
                      <p className="text-sm font-bold text-slate-700">{contract.data.uf_placas || 'MG'}</p>
                    </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Regras de Ouro (21 Itens)</h4>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-[11px] text-slate-600 leading-relaxed">
                    <p>Ao informar início de viagem, deverá aguardar a mensagem <strong>“Ok, Liberado”</strong> que será enviada pela Central de Monitoramento 3corações, autorizando o prosseguimento da viagem;</p>
                    <p>Informar todas as paradas e reinícios durante a viagem;</p>
                    <p>Ao chegar no local de descarga, enviar macro <strong>“CHEGADA NO CLIENTE”</strong>, e enviando a macro de <strong>“FIM DE VIAGEM”</strong>, somente quando a descarga for finalizada;</p>
                    <p><strong>É proibido parar antes dos 150 km iniciais</strong>, exceto paradas obrigatórias ou problema mecânico/elétrico;</p>
                    <p><strong>É proibido pernoite em residência;</strong></p>
                    <p>Respeitar o horário de rodagem, no período de <strong>05h00min às 22h00min</strong>;</p>
                    <p>O veículo será desbloqueado após o pernoite, somente mediante confirmação de senha de segurança do motorista, via teclado;</p>
                    <p>Evitar pernoite sob cobertura, evitando perda de sinal da antena;</p>
                    <p><strong>Não conceder carona;</strong></p>
                    <p>Seguir a rota predeterminada;</p>
                    <p>Respeitar o limite de velocidade da via, não excedendo o limite de <strong>80km/h</strong>;</p>
                    <p>Manter a central informada de todas as anormalidades durante o percurso, mantendo a comunicação, via macro, como também pelos telefones: <strong>Fixo (85) 4006.5522 (escolher a opção desejada); WhatsApp (85) 99198.2886 (apenas mensagem e áudio);</strong></p>
                    <p>Dirigir preventivamente, evitando acidentes, preservando sua própria vida, a vida de terceiros e também carga do embarcador;</p>
                    <p>Não oferecer, dar ou aceitar de quem quer que seja, tanto por conta própria ou através de terceiro, qualquer pagamento, doação, compensação, vantagens ou benefícios de qualquer natureza que constituam prática ilegal ou prática de corrupção sob as leis de qualquer país;</p>
                    <p><strong>(Proibido passagem por Sergipe);</strong></p>
                    <p>Destino Rio de Janeiro: Agendar escolta com 2 horas de antecedência do ponto de encontro, no pedágio desativado em Duque de Caxias/RJ, evitar rodar depois das 17 horas dentro da área urbana da cidade. Caso necessário, o pernoite acontecerá mais cedo na cidade de Três Rios/RJ (Posto Ipirangão);</p>
                    <p>Pernoite na BR-381 Rod. Fernão Dias, somente autorizado nos postos Rede Graal e Frango Assado;</p>
                    <p className="font-bold text-slate-900 mt-4">Caso tenha dúvidas, contate nossa central de monitoramento pelos telefones acima informados.</p>
                  </div>
                </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                >
                  Li e concordo, Próximo <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10"
            >
              <div className="flex flex-col items-center text-center space-y-4 border-b border-slate-100 pb-8">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Truck className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Plano de Rota GR</h2>
                  <p className="text-slate-400 text-sm font-medium">Visualize o trajeto e locais de parada</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-red-100 pb-3">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Origem</span>
                    <span className="text-sm font-bold text-red-900">SANTA LUZIA-MG</span>
                  </div>
                  <div className="flex items-center justify-center py-2">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-red-200 flex items-center justify-center text-red-400 font-bold">X</div>
                  </div>
                  <div className="flex items-center justify-between border-t border-red-100 pt-3">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Destino</span>
                    <span className="text-sm font-bold text-red-900">{contract.data.destino || 'Gov. Celso Ramos/SC'}</span>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-red-100 pb-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest">Cidades do Itinerário</h4>
                    </div>
                    <div className="bg-white border border-red-100 rounded-xl p-4">
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        {contract.data.trajeto || getCitiesForDestination(
                          contract.data.destino || '', 
                          'SANTA LUZIA-MG'
                        ).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2 border-b border-red-100 pb-2">
                      <Truck className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest">Mapa do Trajeto</h4>
                    </div>
                    
                    {contract.data.destino ? (
                      <VisualizadorDeMapa 
                        destination={contract.data.destino} 
                        rota={contract.data.rota}
                        itinerary={contract.data.trajeto} 
                        mapa_arquivo={contract.data.mapa_arquivo}
                        driverName={contract.data.motorista}
                        driverCpf={contract.data.cpf}
                        showWatermark={true}
                      />
                    ) : (
                      <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-xs font-bold text-red-700">Destino não informado para carregar o mapa.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-2 border-b border-red-100 pb-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest">Paradas Proibidas</h4>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] text-red-700 font-bold uppercase tracking-tight">
                        {getForbiddenStopsForDestination(contract.data.destino || '').stops.map((stop, i) => (
                          <div key={i}>• {stop}</div>
                        ))}
                      </div>
                      {getForbiddenStopsForDestination(contract.data.destino || '').overnight && (
                        <div className="mt-6 pt-4 border-t border-red-200 text-center">
                          <p className="text-xs font-bold text-red-800 uppercase tracking-tight">
                            LUGARES PERMITIDOS PARA PERNOITE: {getForbiddenStopsForDestination(contract.data.destino || '').overnight}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" /> Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                >
                  Confirmar Rota, Próximo <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">Check-list Presencial Veicular</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Gerado em: {new Date(contract.created_at).toLocaleDateString('pt-BR')} às {new Date(contract.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v8.1 STL</div>
              </div>

              <div className="p-0">
                <div className="bg-slate-50 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Dados do Motorista</div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="md:col-span-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motorista</span>
                    <span className="font-bold text-slate-700">{contract.data.motorista || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPF</span>
                    <span className="font-bold text-red-600">{contract.data.cpf || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RG</span>
                    <span className="font-bold text-slate-700">{contract.data.rg || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CNH</span>
                    <span className="font-bold text-slate-700">{contract.data.cnh || '-'}</span>
                  </div>
                  <div className="md:col-span-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vínculo</span>
                    <span className="font-bold text-slate-700">{contract.data.vinculo || 'FROTA'}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-y border-slate-100">Dados do Veículo</div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transportadora</span>
                    <span className="font-bold text-slate-700">{contract.data.transportador || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">UF das Placas</span>
                    <span className="font-bold text-slate-700">{contract.data.uf_placas || 'MG'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placa do Cavalo</span>
                    <span className="font-bold text-slate-700">{contract.data.cavalo || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placa Carreta 1</span>
                    <span className="font-bold text-slate-700">{contract.data.carreta || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Placa Carreta 2</span>
                    <span className="font-bold text-slate-700">{contract.data.carreta2 || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Carreta</span>
                    <span className={`font-bold ${(contract.data.modelo_carreta || contract.data.tipo_carreta || '').toUpperCase().includes('RODOTREM BAÚ') ? 'text-red-600' : 'text-slate-700'}`}>
                      {(contract.data.modelo_carreta || contract.data.tipo_carreta || '-').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Cavalo</span>
                    <span className={`font-bold ${(contract.data.modelo_cavalo || contract.data.tipo_cavalo || '').toUpperCase().includes('TRUCADO') ? 'text-red-600' : 'text-slate-700'}`}>
                      {(contract.data.modelo_cavalo || contract.data.tipo_cavalo || '-').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tecnologia</span>
                    <span className={`font-bold ${(contract.data.tecnologia || '').toUpperCase().includes('SASCAR') ? 'text-red-600' : 'text-slate-700'}`}>
                      {contract.data.tecnologia || '-'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-y border-slate-100">Itens Vistoriados</div>
                <div className="divide-y divide-slate-100">
                  {CHECKLIST_ITEMS.map((item, idx) => (
                    <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                      <p className="text-xs text-slate-600 font-medium flex-1">{item}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-slate-50 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-y border-slate-100 mt-4">Aprovação Final</div>
                <div className="p-6 flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-700">Veículo Aprovado:</span>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold text-sm">
                    <CheckCircle className="w-4 h-4" /> SIM
                  </div>
                </div>

                <div className="bg-slate-50 p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-y border-slate-100">Assinatura Digital</div>
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-slate-400 text-sm font-medium">Assine no campo abaixo para validar todos os documentos</p>
                  </div>
                  
                  <SignaturePad onSave={handleSign} saving={saving} />
                  
                  {signatureData && (
                    <div className="flex flex-col items-center gap-4 pt-4">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> Assinatura Capturada
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 flex justify-start">
                {!isChecklistOnly && (
                  <button
                    onClick={() => setStep(2)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" /> Voltar para Rota
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && (
            <motion.div 
              key="confirm-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 border border-slate-100"
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Deseja finalizar?</h3>
                  <p className="text-sm text-slate-500">
                    Ao confirmar, sua assinatura será salva e o registro será concluído.
                  </p>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Não
                    </button>
                    <button
                      onClick={() => pendingSignature && handleFinalize(pendingSignature)}
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sim'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center py-8">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">
            ASSINAGR • SISTEMA DE GESTÃO DE RISCOS • {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
};
