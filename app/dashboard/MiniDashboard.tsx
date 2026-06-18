'use client';

import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import { useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface PontoMini {
  id: number;
  titulo: string;
  local: string;
  latitude: number;
  longitude: number;
  isPostoSeguro: boolean;
}

interface MiniMapaProps {
  pontos: PontoMini[];
  posicaoUsuario: [number, number] | null;
}

const MAPA_ESTILO = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export default function MiniMapa({ pontos, posicaoUsuario }: MiniMapaProps) {
  const [popupId, setPopupId] = useState<number | null>(null);
  const popupPonto = pontos.find(p => p.id === popupId) ?? null;

  const centro = posicaoUsuario
    ? { longitude: posicaoUsuario[1], latitude: posicaoUsuario[0], zoom: 13 }
    : { longitude: -49.27134, latitude: -25.43135, zoom: 13 };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <Map
        initialViewState={centro}
        mapStyle={MAPA_ESTILO}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        scrollZoom={false}
      >
        {/* Posição do usuário */}
        {posicaoUsuario && (
          <Marker
            longitude={posicaoUsuario[1]}
            latitude={posicaoUsuario[0]}
            anchor="center"
          >
            <div className="relative flex items-center justify-center w-6 h-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 shadow-[0_0_14px_#34d399] border-2 border-white" />
            </div>
          </Marker>
        )}

        {/* Pontos de ocorrência e postos */}
        {pontos.map(ponto => (
          <Marker
            key={ponto.id}
            longitude={ponto.longitude}
            latitude={ponto.latitude}
            anchor="center"
            onClick={e => { e.originalEvent.stopPropagation(); setPopupId(ponto.id); }}
          >
            <div className="relative flex items-center justify-center w-5 h-5 cursor-pointer">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${ponto.isPostoSeguro ? 'bg-blue-400' : 'bg-red-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${ponto.isPostoSeguro ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {popupPonto && (
          <Popup
            longitude={popupPonto.longitude}
            latitude={popupPonto.latitude}
            anchor="bottom"
            onClose={() => setPopupId(null)}
            closeButton={true}
          >
            <div className="p-1 font-sans">
              <p className="font-bold text-xs text-zinc-800">
                {popupPonto.isPostoSeguro ? 'Posto de Apoio' : 'Alerta'}
              </p>
              <p className="font-semibold text-zinc-700 text-[11px] mt-1">{popupPonto.titulo}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{popupPonto.local}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
