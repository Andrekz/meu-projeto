'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Building2, Users, Zap } from 'lucide-react';
import type { PostoSeguro } from '../postos-seguros/actions';

const MiniMapa = dynamic(() => import('./MiniDashboard'), {
  ssr: false,
  loading: () => <div className="text-zinc-500 text-xs animate-pulse p-4 text-center">Carregando mapa tático...</div>,
});

interface OcorrenciaDB {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: string;
  bairro: string;
  latitude: number | null;
  longitude: number | null;
  criado_em: string;
}

interface DashboardDinamicoProps {
  ocorrenciasIniciais: OcorrenciaDB[];
  postosIniciais: PostoSeguro[];
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function DashboardDinamico({ ocorrenciasIniciais, postosIniciais }: DashboardDinamicoProps) {
  const [relogio, setRelogio] = useState('');
  const [posicaoUsuario, setPosicaoUsuario] = useState<[number, number] | null>(null);
  const [bairroDetectado, setBairroDetectado] = useState('Curitiba');
  const [distanciaMinima, setDistanciaMinima] = useState<string>(() => {
    // Calcula imediatamente com os postos pré-carregados e o centro padrão de Curitiba
    if (postosIniciais.length === 0) return 'N/A';
    const LAT_CURITIBA = -25.4296;
    const LON_CURITIBA = -49.2675;
    let menorD = Infinity;
    postosIniciais.forEach(p => {
      const d = calcularDistancia(LAT_CURITIBA, LON_CURITIBA, p.latitude, p.longitude);
      if (d < menorD) menorD = d;
    });
    return menorD < 1000 ? `${menorD}m` : `${(menorD / 1000).toFixed(1)}km`;
  });
  const [postos, setPostos] = useState<PostoSeguro[]>(postosIniciais);

  // Converte ocorrencias com coordenadas para pontos do mini mapa
  const pontosOcorrencias = ocorrenciasIniciais
    .filter(o => o.latitude !== null && o.longitude !== null)
    .map(o => ({
      id: o.id,
      titulo: o.titulo,
      local: `${o.endereco} · ${o.bairro}`,
      latitude: o.latitude as number,
      longitude: o.longitude as number,
      isPostoSeguro: false,
    }));

  const pontosPostos = postos.map(p => ({
    id: p.id,
    titulo: p.nome,
    local: p.endereco || 'Localização mapeada',
    latitude: p.latitude,
    longitude: p.longitude,
    isPostoSeguro: true,
  }));

  const todosPontos = [...pontosOcorrencias, ...pontosPostos];

  useEffect(() => {
    const intervalRelogio = setInterval(() => {
      setRelogio(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    let geoWatchId: number | null = null;
    let ultimaChamada = 0;

    if ('geolocation' in navigator) {
      geoWatchId = navigator.geolocation.watchPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setPosicaoUsuario([latitude, longitude]);

          const agora = Date.now();
          if (agora - ultimaChamada < 15000) return;
          ultimaChamada = agora;

          // Busca postos do banco (via API route) com base na posição real do usuário
          try {
            const res = await fetch(`/api/postos-seguros?lat=${latitude}&lon=${longitude}&raio=3000`);
            if (res.ok) {
              const { postos: novosPostos } = await res.json();
              setPostos(novosPostos);

              if (novosPostos.length > 0) {
                let menorD = Infinity;
                novosPostos.forEach((p: PostoSeguro) => {
                  const d = calcularDistancia(latitude, longitude, p.latitude, p.longitude);
                  if (d < menorD) menorD = d;
                });
                setDistanciaMinima(menorD < 1000 ? `${menorD}m` : `${(menorD / 1000).toFixed(1)}km`);
              }
            }
          } catch {}

          // Reverse geocoding
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { 'User-Agent': 'IterVigilans-Academic-Project-guiselig10' } }
            );
            if (res.ok) {
              const data = await res.json();
              const bairro = data.address?.suburb || data.address?.neighbourhood || data.address?.city || 'Curitiba';
              setBairroDetectado(bairro);
            }
          } catch {}
        },
        () => {
          setBairroDetectado('Curitiba (GPS desligado)');
          setDistanciaMinima('Ative o GPS');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      clearInterval(intervalRelogio);
      if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
    };
  }, []);

  // Feed mostra ocorrencias mais recentes do banco
  const feedOcorrencias = ocorrenciasIniciais.slice(0, 8);

  return (
    <>
      {/* TAG DE LOCALIZAÇÃO */}
      <div className="mb-4 -mt-4 flex items-center gap-2 select-none">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-xs text-zinc-400">
          Posição do dispositivo: <span className="text-zinc-200 font-semibold">{bairroDetectado}</span>
        </p>
      </div>

      {/* CARDS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 select-none">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Índice de Segurança</p>
            <p className="text-4xl font-bold mt-2 text-emerald-500">70</p>
            <p className="text-xs text-zinc-400 mt-2">Varredura de Satélite Ativa</p>
            <p className="text-xs text-emerald-500 mt-1">Sincronizado: {relogio || '--:--:--'}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
          <AlertTriangle size={24} className="text-red-400" />
          <p className="text-4xl font-bold mt-2 text-white">{feedOcorrencias.length}</p>
          <p className="text-xs text-zinc-400 mt-1">Alertas no banco de dados</p>
          <p className="text-xs text-red-500 mt-2">Atualizado agora</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <Building2 size={24} className="text-blue-400" />
          <p className="text-4xl font-bold mt-2 text-blue-400">{postos.length || '...'}</p>
          <p className="text-xs text-zinc-400 mt-1">Pontos de apoio num raio de 3km</p>
          <p className="text-xs text-emerald-500 mt-2 font-medium">Mais próximo: {distanciaMinima}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <Users size={24} className="text-emerald-400" />
          <p className="text-4xl font-bold mt-2 text-emerald-400 font-mono">142</p>
          <p className="text-xs text-zinc-400 mt-1">Dispositivos mapeados na malha</p>
          <p className="text-xs text-emerald-500 mt-2">Rede ativa</p>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: MAPA + FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-[340px] relative rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
          <MiniMapa pontos={todosPontos} posicaoUsuario={posicaoUsuario} />
        </div>

        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-4 select-none">
              <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
                <Zap size={14} className="text-emerald-500" /> Ocorrências Recentes
              </h3>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-900 px-2 rounded-md font-mono">
                LIVE STREAMING
              </span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[230px] pr-1 scrollbar-thin">
              {feedOcorrencias.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Nenhuma ocorrência registrada ainda.</p>
              ) : (
                feedOcorrencias.map(alerta => (
                  <div
                    key={alerta.id}
                    className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl flex justify-between items-center hover:border-zinc-700 transition-all group duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-6 rounded-full shrink-0 bg-red-500 shadow-[0_0_8px_#ef4444]" />
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
                          {alerta.titulo}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5 truncate font-light">
                          {alerta.endereco} · {alerta.bairro}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-600 font-medium ml-4 whitespace-nowrap text-right">
                      {alerta.tipo}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
