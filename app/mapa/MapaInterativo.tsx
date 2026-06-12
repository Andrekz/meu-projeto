'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function RecenterMap({ centro }: { centro: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (centro) {
            map.setView(centro, 14);
        }
        setTimeout(() => { map.invalidateSize(); }, 250);
    }, [map, centro]);
    return null;
}

const criarIconeCustomizado = (tipo: 'perigo' | 'usuario') => {
    const cores = tipo === 'perigo' ? 'bg-red-600 shadow-[0_0_12px_#dc2626]' : 'bg-emerald-400 shadow-[0_0_14px_#34d399] border-2 border-white';
    const ping = tipo === 'perigo' ? 'bg-red-400' : 'bg-emerald-300';

    return L.divIcon({
        html: `
            <div class="relative flex items-center justify-center w-5 h-5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${ping} opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${cores}"></span>
            </div>
        `,
        className: 'custom-marker-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
};

interface Risco {
    id: number;
    titulo: string;
    bairro: string;
    descricao: string;
    coordenadas: [number, number];
    raioPerigo: number; // em metros
    horarioInicio: number; // Hora do dia que começa o risco (0-23)
    horarioFim: number; // Hora do dia que termina o risco (0-23)
    severidade: 'Alta' | 'Média';
}

interface MapaInterativoProps {
    riscos: Risco[];
    posicaoUsuario: [number, number] | null;
}

export default function MapaInterativo({ riscos, posicaoUsuario }: MapaInterativoProps) {
    const centroInicial: [number, number] = posicaoUsuario || [-25.43135, -49.27134];
    const [filtroSeveridade, setFiltroSeveridade] = useState<string>('Todos');

    const riscosFiltrados = riscos.filter(r => 
        filtroSeveridade === 'Todos' || r.severidade === filtroSeveridade
    );

    return (
        <div className="w-full h-[calc(100vh-140px)] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex flex-col md:flex-row">
            
            {/* PAINEL LATERAL DE FILTROS */}
            <div className="w-full md:w-80 bg-zinc-900 p-5 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <span>🗺️</span> Filtros de Risco
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Dados contextualizados com a hora atual do sistema.</p>
                    
                    <div className="mt-6 space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 block">Nível de Alerta:</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Todos', 'Alta', 'Média'].map((tipo) => (
                                <button
                                    key={tipo}
                                    onClick={() => setFiltroSeveridade(tipo)}
                                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                                        filtroSeveridade === tipo 
                                            ? 'bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                    }`}
                                >
                                    {tipo}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LISTA RESUMIDA DO SETOR */}
                    <div className="mt-6">
                        <span className="text-xs font-semibold text-zinc-400 block mb-2">Zonas Críticas Ativas ({riscosFiltrados.length})</span>
                        <div className="space-y-2 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
                            {riscosFiltrados.map(r => (
                                <div key={r.id} className="p-3 bg-zinc-950 border border-zinc-800/60 rounded-xl text-left">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-xs text-zinc-200 truncate max-w-[140px]">{r.titulo}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold uppercase ${
                                            r.severidade === 'Alta' ? 'bg-red-950/60 border-red-900 text-red-400' : 'bg-amber-950/60 border-amber-900 text-amber-400'
                                        }`}>
                                            {r.severidade}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">{r.bairro} · {r.horarioInicio}h às {r.horarioFim}h</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-4 mt-4">
                    🔴 Círculos vermelhos representam o perímetro estimado de atenção baseado em manchas criminais.
                </div>
            </div>

            {/* AREA DO MAPA INTERATIVO */}
            <div className="flex-1 relative h-full">
                <MapContainer center={centroInicial} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <RecenterMap centro={centroInicial} />

                    {/* Marcador do Usuário */}
                    {posicaoUsuario && (
                        <Marker position={posicaoUsuario} icon={criarIconeCustomizado('usuario')}>
                            <Popup>
                                <div className="p-1 text-center font-sans">
                                    <span className="font-bold text-emerald-600 text-xs">Sua Posição Atual</span>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Áreas e Marcadores de Risco */}
                    {riscosFiltrados.map((risco) => (
                        <div key={risco.id}>
                            {/* Círculo de Calor/Perigo */}
                            <Circle 
                                center={risco.coordenadas}
                                radius={risco.raioPerigo}
                                pathOptions={{
                                    color: risco.severidade === 'Alta' ? '#ef4444' : '#f59e0b',
                                    fillColor: risco.severidade === 'Alta' ? '#ef4444' : '#f59e0b',
                                    fillOpacity: 0.15,
                                    weight: 1.5,
                                    dashArray: '4, 4'
                                }}
                            />
                            {/* Pino Central do Perigo */}
                            <Marker position={risco.coordenadas} icon={criarIconeCustomizado('perigo')}>
                                <Popup>
                                    <div className="text-zinc-950 p-1 font-sans max-w-[200px]">
                                        <h5 className="font-bold text-xs flex items-center gap-1 text-red-600">
                                            ⚠️ Alerta de Risco ({risco.severidade})
                                        </h5>
                                        <p className="font-bold text-zinc-900 text-xs mt-1.5">{risco.titulo}</p>
                                        <p className="text-[11px] text-zinc-700 mt-0.5 leading-relaxed">{risco.descricao}</p>
                                        <div className="mt-2 pt-1 border-t border-zinc-200 text-[9px] text-zinc-400 font-medium">
                                            Horário crítico: {risco.horarioInicio}:00h até {risco.horarioFim}:00h
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        </div>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}