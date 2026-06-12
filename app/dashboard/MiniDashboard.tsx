'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function RecenterMap({ centro }: { centro: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !centro) return;

        map.setView(centro, 14);

        const timerId = setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 250);

        return () => {
            clearTimeout(timerId);
        };
    }, [map, centro]);

    return null;
}

// Gerador de Ícones customizados HTML/Tailwind
const criarIconeCustomizado = (tipo: 'vermelho' | 'azul' | 'usuario') => {
    let cores = 'bg-red-500 shadow-[0_0_10px_#ef4444]';
    let ping = 'bg-red-400';
    
    if (tipo === 'azul') {
        cores = 'bg-blue-500 shadow-[0_0_10px_#3b82f6]';
        ping = 'bg-blue-400';
    } else if (tipo === 'usuario') {
        cores = 'bg-emerald-400 shadow-[0_0_14px_#34d399] border-2 border-white';
        ping = 'bg-emerald-300';
    }

    return L.divIcon({
        html: `
            <div class="relative flex items-center justify-center w-5 h-5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${ping} opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 ${cores}"></span>
            </div>
        `,
        className: 'custom-marker-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
};
interface Alerta {
    id: number;
    titulo: string;
    local: string;
    isPostoSeguro: boolean;
    coordenadas: [number, number];
    minutosAtras: number; 
    severidade?: 'Alta' | 'Media';
    raioPerigo?: number;
}

interface Ponto {
    id: number;
    titulo: string;
    local: string;
    coordenadas: [number, number];
    isPostoSeguro: boolean;
}

interface MiniMapaProps {
    pontos: Ponto[];
    posicaoUsuario: [number, number] | null;
}

export default function MiniMapa({ pontos, posicaoUsuario }: MiniMapaProps) {
    // Padrão inicial: Centro de Curitiba se o GPS estiver desligado
    const centroMapa: [number, number] = posicaoUsuario || [-25.43135, -49.27134];

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <MapContainer 
                center={centroMapa} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                
                <RecenterMap centro={centroMapa} />

                {/* Marcador Exclusivo da Posição Real do Usuário */}
                {posicaoUsuario && (
                    <Marker position={posicaoUsuario} icon={criarIconeCustomizado('usuario')}>
                        <Popup>
                            <div className="text-zinc-950 p-1 font-sans text-center">
                                <span className="font-bold text-emerald-600 text-xs">Você está aqui</span>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Sua localização atual aproximada.</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Demais pontos de segurança e risco */}
                {pontos.map((ponto) => (
                    <Marker 
                        key={ponto.id} 
                        position={ponto.coordenadas} 
                        icon={criarIconeCustomizado(ponto.isPostoSeguro ? 'azul' : 'vermelho')}
                    >
                        <Popup>
                            <div className="text-zinc-950 p-1 font-sans">
                                <h5 className="font-bold text-xs">
                                    {ponto.isPostoSeguro ? '🔵 Posto de Apoio' : '🔴 Alerta'}
                                </h5>
                                <p className="font-semibold text-zinc-800 text-[11px] mt-1">{ponto.titulo}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{ponto.local}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}