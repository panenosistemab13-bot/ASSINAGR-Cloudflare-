import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import { LOGO_3_CORACOES } from '../constants';
import { getCitiesForDestination } from '../utils/itineraryUtils';
import { api } from '../services/api';
import { MAPA_REFERENCIA } from './AdminDashboard';

// Correção para ícones do Leaflet no Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface VisualizadorDeMapaProps {
  destination: string;
  itinerary?: string;
  mapa_arquivo?: string;
  driverName?: string;
  driverCpf?: string;
  showWatermark?: boolean;
}

// Componente para atualizar o centro do mapa quando as coordenadas mudarem
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ 
  destination, 
  itinerary, 
  mapa_arquivo,
  driverName,
  driverCpf,
  showWatermark = false
}) => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [terms, setTerms] = useState<any>(null);

  useEffect(() => {
    api.settings.getTerms().then(data => {
      if (data) setTerms(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchCoords = async () => {
      // Se não houver destino, não faz nada
      if (!destination) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        
        // 1. Prioridade Máxima: Coordenadas Reais do Banco de Dados (Firestore)
        if (terms?.latitude && terms?.longitude) {
          const lat = parseFloat(terms.latitude);
          const lon = parseFloat(terms.longitude);
          
          if (!isNaN(lat) && !isNaN(lon)) {
            console.log("Usando coordenadas do banco:", lat, lon);
            setCoords([lat, lon]);
            setLoading(false);
            return;
          }
        }

        // 2. Segunda Opção: Geocodificação via Nominatim baseada no Destino
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`);
          const data = await response.json();

          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setCoords([lat, lon]);
            setLoading(false);
            return;
          }
        } catch (osmErr) {
          console.warn("Falha ao consultar Nominatim:", osmErr);
        }

        // 3. Fallback Final: Coordenada Regional Padrão (Santa Luzia/MG - Matriz)
        // Isso evita que o mapa carregue "no mar" ou em lugar aleatório
        console.warn("Usando fallback regional padrão");
        setCoords([-19.7697, -43.8523]); 
        
      } catch (err) {
        console.error("Erro total ao buscar coordenadas:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCoords();
  }, [destination, terms]);

  // Processar o itinerário
  const cities = itinerary 
    ? itinerary.split(/[;|\n]+/).map(city => city.trim()).filter(city => city.length > 0)
    : getCitiesForDestination(destination);

  // Componente de Marca d'Água Repetida
  const WatermarkOverlay = () => {
    if (!showWatermark) return null;

    const watermarkText = `CONFIDENCIAL - LOGÍSTICA 3CORAÇÕES | ${driverName || 'MOTORISTA'} | ${driverCpf || 'CPF'}`;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.10] select-none z-[1000]">
        <div 
          className="w-[200%] h-[200%] -top-1/2 -left-1/2 flex flex-wrap content-start justify-center gap-x-24 gap-y-32 rotate-[-25deg]"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap text-slate-900 font-black text-sm tracking-widest uppercase">
              {watermarkText}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 1. Identificar a Rota (via parâmetro de URL ou detecção de palavra-chave no destino)
  const getSelectedRoute = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const rotaParam = urlParams.get('rota');
    if (rotaParam) return rotaParam.toUpperCase();

    const dest = destination?.toUpperCase() || "";
    // Lista de referência por prioridade (do mais específico para o mais geral)
    const sortedKeys = Object.keys(MAPA_REFERENCIA).sort((a, b) => b.length - a.length);
    const match = sortedKeys.find(key => dest.includes(key));
    return match || dest;
  };

  const currentRoute = getSelectedRoute();

  // 2. Buscar a URL dinâmica do banco de dados (Firestore: settings/termos)
  const getDynamicImageUrl = () => {
    if (!terms) return null;
    
    // Procura por campos como: url_mapa_NATAL, url_imagem_NATAL, ou dentro de um objeto 'rotas'
    // Priorizamos o padrão configurável: url_mapa_[NOME_DA_ROTA]
    const key = `url_mapa_${currentRoute.replace(/\s+/g, '_')}`;
    const keyAlternative = `url_imagem_${currentRoute.replace(/\s+/g, '_')}`;
    
    return terms[key] || terms[keyAlternative] || terms.url_mapa || terms.url_imagem || null;
  };

  const dynamicUrl = getDynamicImageUrl();

  // Fallback para NATAL fixo conforme pedido anterior se não houver no banco
  const natalFallback = currentRoute.includes('NATAL') ? 'https://i.postimg.cc/KcCxBb3N/NATAL.png' : null;
  const finalImageUrl = dynamicUrl || natalFallback;

  return (
    <div className="w-full bg-white border-2 border-slate-800 rounded-none overflow-hidden shadow-none font-sans relative">
      <style>{`
        .leaflet-container {
          width: 100%;
          height: 100%;
          z-index: 10;
        }
      `}</style>
      
      {/* Cabeçalho Profissional (Logo + Título) */}
      <div className="border-b-2 border-slate-800 flex items-center">
        <div className="w-32 p-2 border-r-2 border-slate-800 flex justify-center items-center bg-white">
          <img src={LOGO_3_CORACOES} alt="3corações" className="h-12 w-auto object-contain" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1 p-4 bg-white text-center">
          <h2 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">
            PLANO DE ROTA GERENCIAMENTO DE RISCOS - GR
          </h2>
        </div>
      </div>

      {/* Orientações */}
      <div className="p-3 bg-white border-b-2 border-slate-800 text-[10px] leading-tight text-slate-800 space-y-1">
        <p className="font-bold">Orientações sobre o PLANO DE ROTA</p>
        <div className="whitespace-pre-line">
          {terms?.orientacoes_rota || (
            <>
              <p>a. É proibida parada nos primeiros 150 km iniciais, exceto problema mecânico/elétrico;</p>
              <p>b. Respeitar o horário de rodagem, no período de 05h00min às 22h00min para produto acabado e 05h00min às 19h00min para o transporte de grãos;</p>
              <p>c. Qualquer desvio de trajeto sem prévia autorização é uma falta grave.</p>
            </>
          )}
        </div>
      </div>

      {/* Título da Rota */}
      <div className="bg-slate-100 p-2 border-b-2 border-slate-800 text-center">
        <h3 className="text-[11px] font-bold text-slate-900 uppercase">
          Plano de Rota ({currentRoute})
        </h3>
      </div>

      <div className="flex flex-col border-b-2 border-slate-800 h-[450px]">
        {/* Área do Mapa (Esquerda) */}
        <div className="w-full h-full bg-slate-50 relative overflow-hidden flex flex-col md:flex-row">
          <div className="flex-1 relative min-h-[300px] md:min-h-0 border-b-2 md:border-b-0 md:border-r-2 border-slate-800">
            {finalImageUrl ? (
              <div className="relative w-full h-full bg-white flex items-center justify-center overflow-hidden">
                <img 
                  src={finalImageUrl} 
                  alt={`Mapa ${currentRoute}`} 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer"
                />
                <WatermarkOverlay />
              </div>
            ) : loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-[1001] bg-white/80">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Carregando Mapa...</p>
              </div>
            ) : (
              <>
                {coords ? (
                  <>
                    <MapContainer center={coords} zoom={12} scrollWheelZoom={false}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={coords}>
                        <Popup>
                          Destino: {destination}
                        </Popup>
                      </Marker>
                      <ChangeView center={coords} />
                    </MapContainer>
                    <WatermarkOverlay />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-2 z-[1001] bg-white">
                    <p className="text-xs text-slate-400 font-medium italic">Visualização do mapa indisponível</p>
                    <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold">Roteiro: {currentRoute}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Cidades do Itinerário (Direita) */}
          <div className="w-full md:w-72 bg-white flex flex-col shrink-0">
            <div className="bg-slate-100 p-2 border-b-2 border-slate-800 text-center">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Cidades do Itinerário</h3>
            </div>
            <div className="flex-1 overflow-auto max-h-[150px] md:max-h-none custom-scrollbar">
              <table className="w-full border-collapse text-[10px]">
                <tbody>
                  {cities.length > 0 ? (
                    cities.map((city, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="p-2 font-medium text-slate-700 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                          {city}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 text-center text-slate-400 italic">Itinerário não disponível</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizadorDeMapa;
