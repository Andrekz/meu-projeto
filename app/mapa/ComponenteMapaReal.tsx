'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 1. DEFINIÇÃO DA INTERFACE EXATA QUE O PAGE.TSX ESPERA
export interface MapaRealProps {
    riscos: any[];
    posicaoUsuario: [number, number] | null;
}

// Componente auxiliar para gerenciar o foco do mapa de forma segura
function ControladorDoMapa({ posicaoUsuario, riscos }: MapaRealProps) {
    const map = useMap();
    const [mapaInicializado, setMapaInicializado] = useState(false);

    useEffect(() => {
        if (!map || mapaInicializado) return;

        // Tenta focar no usuário, senão foca no primeiro risco, senão Curitiba
        let centro: [number, number] = [-25.4296, -49.2675]; // Curitiba padrão

        if (posicaoUsuario) {
            centro = posicaoUsuario;
        } else if (riscos && riscos.length > 0) {
            centro = riscos[0].coordenadas;
        }

        map.setView(centro, 14);

        // Proteção contra desmontagem rápida do componente (Erro da image_5.png)
        const timerId = setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 250);

        setMapaInicializado(true);

        // FUNÇÃO DE LIMPEZA (Cleanup) - Fundamental para estabilidade
        return () => {
            clearTimeout(timerId);
        };
    }, [map, posicaoUsuario, riscos, mapaInicializado]);

    return null;
}

// Ícone simples para o usuário
const iconeUsuario = L.divIcon({
    html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse z-50"></div>`,
    className: 'custom-user-dot',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

export default function ComponenteMapaReal({ riscos, posicaoUsuario }: MapaRealProps) {
    // Foco padrão inicial enquanto nada carrega
    const centroInicial: [number, number] = [-25.4296, -49.2675];

    return (
        <div className="w-full h-full relative">
            <style dangerouslySetInnerHTML={{__html: `
                .leaflet-tile-container img {
                    mix-blend-mode: plus-lighter;
                }
                .leaflet-container {
                    background: #09090b !important;
                }
            `}} />

            <MapContainer 
                center={centroInicial} 
                zoom={14} 
                style={{ height: '100%', width: '100%', zIndex: 10 }} 
                zoomControl={false}
                attributionControl={false}
            >
                {/* Mapa base escuro */}
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                
                {/* Lógica de controle de câmera e cleanup */}
                <ControladorDoMapa posicaoUsuario={posicaoUsuario} riscos={riscos} />

                {/* Renderização das Zonas de Risco */}
                {riscos && riscos.map((risco) => (
                    <Circle
                        key={risco.id}
                        center={risco.coordenadas}
                        radius={risco.raioPerigo}
                        pathOptions={{
                            color: risco.severidade === 'Alta' ? '#ef4444' : '#f59e0b',
                            fillColor: risco.severidade === 'Alta' ? '#ef4444' : '#f59e0b',
                            fillOpacity: 0.2,
                            weight: 1,
                        }}
                    >
                        <Popup>
                            <div className="text-zinc-900 font-sans p-1">
                                <strong className="text-sm block">{risco.titulo}</strong>
                                <span className="text-xs text-zinc-600">📍 {risco.local}</span>
                                <div className="mt-2 text-[10px] font-bold text-red-600 uppercase">
                                    Severidade: {risco.severidade}
                                </div>
                            </div>
                        </Popup>
                    </Circle>
                ))}

                {/* Marcador do Usuário */}
                {posicaoUsuario && (
                    <Marker position={posicaoUsuario} icon={iconeUsuario}>
                        <Popup><span className="text-zinc-950 font-bold text-xs">Sua localização</span></Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
}