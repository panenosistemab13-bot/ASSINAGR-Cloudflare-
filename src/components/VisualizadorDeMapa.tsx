import React, { useEffect, useState } from 'react';

import { LOGO_3_CORACOES } from '../constants';
import { getCitiesForDestination } from '../utils/itineraryUtils';
import { api } from '../services/api';

interface VisualizadorDeMapaProps {
  destination: string;
  itinerary?: string;
  mapa_arquivo?: string;
  driverName?: string;
  driverCpf?: string;
  showWatermark?: boolean;
}

const VisualizadorDeMapa: React.FC<VisualizadorDeMapaProps> = ({ 
  destination, 
  itinerary, 
  mapa_arquivo,
  driverName,
  driverCpf,
  showWatermark = false
}) => {
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [terms, setTerms] = useState<any>(null);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    api.settings.getTerms().then(data => {
      if (data) setTerms(data);
    }).catch(console.error);

    const fetchMap = async () => {
      if (!destination) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(false);
        
        // Verifica se temos a chave do Google Maps configurada no VITE_GOOGLE_MAPS_API_KEY
        if (googleMapsApiKey) {
          // Renderiza o mapa estático oficial do google maps se a chave existir
          const targetLocation = encodeURIComponent(destination);
          setMapImage(`https://maps.googleapis.com/maps/api/staticmap?center=${targetLocation}&zoom=10&size=600x450&maptype=roadmap&markers=color:red%7Clabel:D%7C${targetLocation}&key=${googleMapsApiKey}`);
        } else if (mapa_arquivo) {
          // Fallback para arquivo estático
          setMapImage(`/mapas-rotas/${mapa_arquivo}`);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Erro ao buscar mapa:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMap();
  }, [destination, mapa_arquivo, googleMapsApiKey]);

  const handleImageError = () => {
    console.warn("Erro ao carregar imagem do mapa, tentando fallback...");
    setError(true);
  };

  // Processar o itinerário
  const cities = itinerary 
    ? itinerary.split(/[;|\n]+/).map(city => city.trim()).filter(city => city.length > 0)
    : getCitiesForDestination(destination);

  // Componente de Marca d'Água Repetida
  const WatermarkOverlay = () => {
    if (!showWatermark) return null;

    const watermarkText = `CONFIDENCIAL - LOGÍSTICA 3CORAÇÕES | ${driverName || 'MOTORISTA'} | ${driverCpf || 'CPF'}`;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] select-none z-10">
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

  return (
    <div className="w-full bg-white border-2 border-slate-800 rounded-none overflow-hidden shadow-none font-sans relative">
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
          Plano de Rota ({destination})
        </h3>
      </div>

      <div className="flex flex-col border-b-2 border-slate-800 min-h-[450px]">
        {/* Área do Mapa (Esquerda) */}
        <div className="w-full bg-white relative overflow-hidden border-b-2 border-slate-800">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Carregando Mapa...</p>
            </div>
          ) : error || !mapImage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-2">
              <p className="text-xs text-slate-400 font-medium italic">Visualização do mapa indisponível</p>
              <p className="text-[9px] text-slate-300 uppercase tracking-wider font-bold">Destino: {destination}</p>
            </div>
          ) : (
            <>
              <img 
                src={mapImage} 
                alt={`Mapa para ${destination}`}
                className="w-full h-full block object-cover relative z-0 scale-125"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
              <WatermarkOverlay />
            </>
          )}
        </div>

        {/* Cidades do Itinerário (Direita) - Restaurada conforme solicitado */}
        <div className="w-full md:w-72 bg-white flex flex-col">
          <div className="bg-slate-100 p-2 border-b-2 border-slate-800 text-center">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Cidades do Itinerário</h3>
          </div>
          <div className="flex-1 overflow-auto max-h-[300px] md:max-h-none">
            <table className="w-full border-collapse text-[10px]">
              <tbody>
                {cities.length > 0 ? (
                  cities.map((city, index) => (
                    <tr key={index} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-700">{city}</td>
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
  );
};

export default VisualizadorDeMapa;
