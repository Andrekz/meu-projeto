'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MiniMapa = dynamic(() => import('./MiniDashboard'), {
    ssr: false,
    loading: () => <div className="text-zinc-500 text-xs animate-pulse p-4 text-center">Carregando mapa tático...</div>
});

interface PontoOperacional {
    id: number;
    titulo: string;
    local: string;
    isPostoSeguro: boolean;
    coordenadas: [number, number];
    minutosAtras?: number;
}

// Ocorrências simuladas base para o Centro
const OCORRENCIAS_BASE: PontoOperacional[] = [
    { id: 1, titulo: 'Furto/Assalto relatado', local: 'Rua XV de Novembro, próx. ao Largo', minutosAtras: 12, isPostoSeguro: false, coordenadas: [-25.4296, -49.2711] },
    { id: 2, titulo: 'Iluminação pública precária', local: 'Av. Sete de Setembro, trecho 400', minutosAtras: 58, isPostoSeguro: false, coordenadas: [-25.4372, -49.2685] },
    { id: 3, titulo: 'Via completamente deserta', local: 'R. Marechal Floriano Peixoto', minutosAtras: 120, isPostoSeguro: false, coordenadas: [-25.4345, -49.2727] }
];

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
}

export default function DashboardDinamico() {
    const [usuariosAtivos, setUsuariosAtivos] = useState(142);
    const [relogio, setRelogio] = useState('');
    const [localizacaoUsuario, setLocalizacaoUsuario] = useState<[number, number] | null>(null);
    const [bairroDetectado, setBairroDetectado] = useState('Detectando...');
    const [distanciaMinima, setDistanciaMinima] = useState<string>('Calculando...');
    const [quantidadePostos, setQuantidadePostos] = useState(0);

    // Começa apenas com as ocorrências no mapa
    const [pontos, setPontos] = useState<PontoOperacional[]>(OCORRENCIAS_BASE);

    // FUNÇÃO QUE CONSOME A OVERPASS API
    const buscarPostosSegurosAPI = async (lat: number, lon: number) => {
        const raio = 3000;
        const query = `
        [out:json][timeout:25];
        (
          node["amenity"="police"](around:${raio},${lat},${lon});
          way["amenity"="police"](around:${raio},${lat},${lon});
          node["amenity"="hospital"](around:${raio},${lat},${lon});
          way["amenity"="hospital"](around:${raio},${lat},${lon});
        );
        out center;
    `;

        try {
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
            const resposta = await fetch(url);

            // Validação crucial: Se a resposta não for JSON válido ou falhar, impede o .json() de quebrar o app
            const contentType = resposta.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                console.warn("Overpass API retornou um formato inválido (Rate Limit atingido). Ignorando esta atualização.");
                return;
            }

            const dados = await resposta.json();

            if (!dados.elements) return;

            const postosMapeados: PontoOperacional[] = dados.elements.map((el: any) => {
                const latitude = el.lat || (el.center && el.center.lat);
                const longitude = el.lon || (el.center && el.center.lon);
                const tipo = el.tags.amenity === 'police' ? 'Posto Policial / Segurança' : 'Unidade de Saúde / Hospital';
                const nomeCompleto = el.tags.name || tipo;
                const rua = el.tags["addr:street"] ? `${el.tags["addr:street"]}, ${el.tags["addr:housenumber"] || ''}` : 'Localização mapeada via GPS';

                return {
                    id: el.id,
                    titulo: nomeCompleto,
                    local: rua,
                    isPostoSeguro: true,
                    coordenadas: [latitude, longitude] as [number, number]
                };
            }).filter((p: any) => p.coordenadas[0] !== undefined);

            setPontos([...OCORRENCIAS_BASE, ...postosMapeados]);
            setQuantidadePostos(postosMapeados.length);

            if (postosMapeados.length > 0) {
                let menorD = Infinity;
                postosMapeados.forEach(p => {
                    const d = calcularDistancia(lat, lon, p.coordenadas[0], p.coordenadas[1]);
                    if (d < menorD) menorD = d;
                });
                setDistanciaMinima(menorD < 1000 ? `${menorD}m` : `${(menorD / 1000).toFixed(1)}km`);
            }
        } catch (erro) {
            console.error("Erro ao processar dados de postos seguros:", erro);
        }
    };

    useEffect(() => {
        let geoWatchId: number | null = null;
        let tempoUltimaChamada = 0; // Guarda a marca de tempo da última requisição aceita

        if ('geolocation' in navigator) {
            geoWatchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocalizacaoUsuario([latitude, longitude]);

                    const agora = Date.now();
                    // SÓ FAZ REQUISIÇÃO PARA AS APIS SE JÁ TIVER PASSADO PELO MENOS 15 SEGUNDOS DESDE A ÚLTIMA
                    // Isso evita o estouro de requisições gerado pelo watchPosition continuo
                    if (agora - tempoUltimaChamada > 15000) {
                        tempoUltimaChamada = agora;

                        // Busca os pontos no mapa de forma controlada
                        buscarPostosSegurosAPI(latitude, longitude);

                        // Reverse Geocoding adicionando o cabeçalho de identificação exigido pela política deles
                        try {
                            const res = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                                {
                                    headers: {
                                        'User-Agent': 'IterVigilans-Academic-Project-Contact-luisgustavo'
                                    }
                                }
                            );

                            const contentType = res.headers.get("content-type");
                            if (contentType && contentType.includes("application/json")) {
                                const data = await res.json();
                                const bairro = data.address.suburb || data.address.neighbourhood || data.address.city || 'Curitiba';
                                setBairroDetectado(bairro);
                            }
                        } catch (e) {
                            console.log("Falha ao descriptografar bairro por congestionamento.");
                        }
                    }
                },
                (error) => {
                    console.error("Erro no GPS:", error);
                    setBairroDetectado('Curitiba (GPS desligado)');
                    setDistanciaMinima("Ative o GPS");
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 5000 // Permite cache de até 5 segundos para suavizar o hardware
                }
            );
        }

        const intervalRelogio = setInterval(() => {
            setRelogio(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);

        return () => {
            clearInterval(intervalRelogio);
            if (geoWatchId !== null) navigator.geolocation.clearWatch(geoWatchId);
        };
    }, []);

    const ocorrenciasParaOFeed = pontos.filter(p => !p.isPostoSeguro);

    return (
        <>
            {/* TAG DE LOCALIZAÇÃO DO OPERADOR */}
            <div className="mb-4 -mt-4 flex items-center gap-2 select-none">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs text-zinc-400">
                    Posição do dispositivo: <span className="text-zinc-200 font-semibold">{bairroDetectado}</span>
                </p>
            </div>

            {/* GRID DE CARDS SUPERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 select-none">
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center">
                    <div>
                        <p className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">Índice de Segurança</p>
                        <p className="text-4xl font-bold mt-2 text-emerald-500">70</p>
                        <p className="text-xs text-zinc-400 mt-2">Varredura de Satélite Ativa</p>
                        <p className="text-xs text-emerald-500 mt-1">Sincronizado: {relogio || '--:--:--'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" style={{ animationDuration: '4s' }}></div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
                    <span className="text-2xl">🚨</span>
                    <p className="text-4xl font-bold mt-2 text-white">{ocorrenciasParaOFeed.length}</p>
                    <p className="text-xs text-zinc-400 mt-1">Alertas ativos no perímetro</p>
                    <p className="text-xs text-red-500 mt-2">▲ Atualizado agora</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <span className="text-2xl">🏥</span>
                    <p className="text-4xl font-bold mt-2 text-blue-400">{quantidadePostos || '...'}</p>
                    <p className="text-xs text-zinc-400 mt-1">Pontos de apoio num raio de 3km</p>
                    <p className="text-xs text-emerald-500 mt-2 font-medium">Mais próximo a: {distanciaMinima}</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                    <span className="text-2xl">👥</span>
                    <p className="text-4xl font-bold mt-2 text-emerald-400 font-mono">{usuariosAtivos}</p>
                    <p className="text-xs text-zinc-400 mt-1">Dispositivos mapeados na malha</p>
                    <p className="text-xs text-emerald-500 mt-2">▲ Rede ativa</p>
                </div>
            </div>

            {/* SEÇÃO INFERIOR: MAPA INTEGRADO + FEED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[340px] relative rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
                    <MiniMapa pontos={pontos} posicaoUsuario={localizacaoUsuario} />
                </div>

                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between h-[340px]">
                    <div>
                        <div className="flex items-center justify-between mb-4 select-none">
                            <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">⚡ Ocorrências Recentes</h3>
                            <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-900 px-2 rounded-md font-mono">
                                LIVE STREAMING
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 overflow-y-auto max-h-[230px] pr-1 scrollbar-thin">
                            {ocorrenciasParaOFeed.map((alerta) => (
                                <div key={alerta.id} className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl flex justify-between items-center hover:border-zinc-700 transition-all group duration-300">
                                    <div className="flex items-center gap-3">
                                        <span className="w-1.5 h-6 rounded-full shrink-0 bg-red-500 shadow-[0_0_8px_#ef4444]" />
                                        <div className="overflow-hidden">
                                            <h4 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors truncate">{alerta.titulo}</h4>
                                            <p className="text-xs text-zinc-500 mt-0.5 truncate font-light">{alerta.local}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-medium ml-4 whitespace-nowrap">
                                        {alerta.minutosAtras} min
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}