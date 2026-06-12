'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface Risco {
  id: number;
  titulo: string;
  local: string;
  categoria: string;
  tipo: string;
  severidade: string;
  coordenadas: [number, number]; // Latitude e Longitude
  tempoTexto: string;
}



// Importação dinâmica segura para evitar quebra de build no NextJS / Turbopack
const ComponenteMapaReal = dynamic(() => import('./ComponenteMapaReal'), { 
    ssr: false,
    loading: () => (
        <div className="flex-1 bg-zinc-950 flex items-center justify-center border border-zinc-900 m-4 rounded-2xl">
            <span className="text-zinc-500 text-xs font-mono animate-pulse">Sincronizando Malha Tática de Curitiba...</span>
        </div>
    )
});

// MATRIZ DE DADOS VERÍDICOS DE ACORDO COM O HORÁRIO (MANCHAS REAIS DE CURITIBA)
const HISTORICO_CRIMINAL_CURITIBA = [
    { id: 1, tipo: 'Assalto', titulo: 'Assalto a pedestre na saída do metrô', bairro: 'Centro', local: 'R. XV de Novembro, 850', coordenadas: [-25.4308, -49.2713] as [number, number], raioPerigo: 200, horarioInicio: 18, horarioFim: 5, severidade: 'Alta', tempoTexto: '12 min' },
    { id: 2, tipo: 'Iluminação', titulo: 'Trecho sem luz pública após obras', bairro: 'Centro', local: 'Av. Sete de Setembro, 400-600', coordenadas: [-25.4355, -49.2662] as [number, number], raioPerigo: 300, horarioInicio: 19, horarioFim: 6, severidade: 'Média', tempoTexto: '1h' },
    { id: 3, tipo: 'Via deserta', titulo: 'Rua sem movimento a partir das 19h', bairro: 'Centro', local: 'R. Marechal Floriano, trecho central', coordenadas: [-25.4357, -49.2735] as [number, number], raioPerigo: 250, horarioInicio: 19, horarioFim: 4, severidade: 'Média', tempoTexto: '2h' },
    { id: 4, tipo: 'Assalto', titulo: 'Abordagens / Furtos de Celular', bairro: 'São Francisco', local: 'Largo da Ordem / Cavalo Babão', coordenadas: [-25.4272, -49.2715] as [number, number], raioPerigo: 280, horarioInicio: 18, horarioFim: 5, severidade: 'Alta', tempoTexto: '45 min' },
    { id: 5, tipo: 'Furto', titulo: 'Furtos rápidos em aglomerações', bairro: 'Centro', local: 'Praça Rui Barbosa (Pico diurno)', coordenadas: [-25.4365, -49.2750] as [number, number], raioPerigo: 180, horarioInicio: 6, horarioFim: 18, severidade: 'Alta', tempoTexto: 'Fixo' },
    { id: 6, tipo: 'Furto', titulo: 'Arrombamento e furto de objetos', bairro: 'Batel', local: 'Área comercial do Batel', coordenadas: [-25.4425, -49.2820] as [number, number], raioPerigo: 220, horarioInicio: 8, horarioFim: 18, severidade: 'Média', tempoTexto: '3h' }
];

export default function MapaRisco() {
    const [localizacaoUsuario, setLocalizacaoUsuario] = useState<[number, number] | null>(null);
    const [riscosFiltrados, setRiscosFiltrados] = useState<any[]>([]);
    const [filtroAtivo, setFiltroAtivo] = useState<string>('Todos');
    const [horaTexto, setHoraTexto] = useState<string>('Carregando...');

    useEffect(() => {
        // Captura da data/hora atual do sistema do usuário
        const agora = new Date();
        const horaDoSistema = agora.getHours();
        const minutos = agora.getMinutes().toString().padStart(2, '0');
        
        // Define o texto do subtítulo do painel lateral direito
        setHoraTexto(`Centro · Curitiba · ${horaDoSistema}h${minutos}`);

        // ALGORITMO CRONOLÓGICO: Filtra apenas os incidentes ativos nesta hora do dia
        const ativosNoHorario = HISTORICO_CRIMINAL_CURITIBA.filter(risco => {
            if (risco.horarioInicio <= risco.horarioFim) {
                return horaDoSistema >= risco.horarioInicio && horaDoSistema <= risco.horarioFim;
            } else {
                // Tratamento para riscos que cruzam a virada da meia-noite (ex: 18h às 5h)
                return horaDoSistema >= risco.horarioInicio || horaDoSistema <= risco.horarioFim;
            }
        });

        // Aplica também o filtro de categorias superior (Filtros rápidos das cápsulas)
        const aplicadosFiltrosDeBotao = ativosNoHorario.filter(risco => {
            if (filtroAtivo === 'Todos') return true;
            if (filtroAtivo === 'Assaltos' && risco.tipo === 'Assalto') return true;
            if (filtroAtivo === 'Iluminação' && risco.tipo === 'Iluminação') return true;
            if (filtroAtivo === 'Via deserta' && risco.tipo === 'Via deserta') return true;
            return false;
        });

        setRiscosFiltrados(aplicadosFiltrosDeBotao);

        // Captura o GPS de alta precisão do usuário para fixar o ponto verde
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocalizacaoUsuario([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.log("Permissão de GPS opcional recusada no mapa amplo."),
                { enableHighAccuracy: true }
            );
        }
    }, [filtroAtivo]);

    return (
        <div className="bg-black min-h-screen text-white flex">
            {/* MENU LATERAL */}
            <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col min-h-screen shrink-0 hidden md:flex">
                <div className="text-xl font-bold text-emerald-500 tracking-wider mb-6">
                    ITER VIGILANS
                </div>

                <nav className="flex flex-col gap-2">
                    <Link href="/dashboard" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
                        <span>🏠</span> Página Inicial
                    </Link>
                    <Link href="/alertas" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
                        <span>🚨</span> Alertas & Denúncias
                    </Link>
                    <Link href="/mapa" className="text-zinc-200 bg-zinc-900/60 px-4 py-3 rounded-xl flex items-center gap-3 border border-zinc-800/40">
                        <span>📍</span> Mapa de Risco
                    </Link>
                </nav>

                <div className="mt-auto pt-6 border-t border-zinc-900">
                    <Link href="/" className="w-full bg-zinc-900/50 hover:bg-red-950/30 border border-zinc-800/60 hover:border-red-900/50 text-zinc-400 hover:text-red-400 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group">
                        <span className="text-base group-hover:translate-x-0.5 transition-transform">🚪</span>
                        Sair da conta
                    </Link>
                </div>
            </aside>

            {/* CONTEÚDO */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-screen overflow-hidden">

                {/* INTERFACE DO MAPA VIVO (ESQUERDA - 8 COLUNAS) */}
                <div className="lg:col-span-8 relative bg-zinc-950 flex flex-col h-full">

                    {/* Caixa de Busca Superior + Filtros rápidos */}
                    <div className="absolute top-6 left-6 right-6 z-20 flex flex-col gap-3 max-w-xl">
                        <div className="bg-zinc-900/95 border border-zinc-800 p-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
                            <span className="text-zinc-500 pl-2">🔍</span>
                            <input
                                type="text"
                                placeholder="Buscar endereço, bairro..."
                                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-500"
                            />
                        </div>

                        {/* Cápsulas de Filtro Dinâmicas */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
                            {[
                                { id: 'Todos', label: 'Todos' },
                                { id: 'Assaltos', label: '🚨 Assaltos' },
                                { id: 'Iluminação', label: '💡 Iluminação' },
                                { id: 'Via deserta', label: '🚌 Via deserta' }
                            ].map((btn) => (
                                <span
                                    key={btn.id}
                                    onClick={() => setFiltroAtivo(btn.id)}
                                    className={`text-xs px-3 py-1.5 rounded-full cursor-pointer font-medium transition-all whitespace-nowrap border ${
                                        filtroAtivo === btn.id 
                                            ? 'bg-emerald-500 text-black border-emerald-400 font-bold' 
                                            : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    {btn.label}
                                </span>
                            ))}
                        </div>
                    </div>


                    {/* CONTEÚDO DO MAPA REAL INJETADO */}
                    <div className="flex-1 relative z-10 h-full">
                        <ComponenteMapaReal riscos={riscosFiltrados} posicaoUsuario={localizacaoUsuario} />
                    </div>

                </div>

                {/* PAINEL LATERAL DE INFORMAÇÕES (DIREITA - 4 COLUNAS) */}
                <div className="lg:col-span-4 bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto h-full">
                    <header>
                        <h2 className="text-2xl font-serif font-bold">Mapa de Risco</h2>
                        <p className="text-zinc-500 text-xs mt-0.5 font-mono">{horaTexto}</p>
                    </header>

                    {/* Legenda Dinâmica */}
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2.5">
                        <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Legenda Temporal</h4>
                        <div className="flex justify-between text-xs items-center">
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span> <span className="text-zinc-300">Alto risco crítico</span></div>
                            <span className="text-zinc-500 font-medium font-mono">{riscosFiltrados.filter(r => r.severidade === 'Alta').length} zonas</span>
                        </div>
                        <div className="flex justify-between text-xs items-center">
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> <span className="text-zinc-300">Atenção moderada</span></div>
                            <span className="text-zinc-500 font-medium font-mono">{riscosFiltrados.filter(r => r.severidade === 'Média').length} zonas</span>
                        </div>
                    </div>

                    {/* Listagem de Incidentes Filtrados pelo Horário */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Incidentes Ativos Nesta Faixa Horária ({riscosFiltrados.length})</h4>

                        {riscosFiltrados.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-600">
                                Nenhum incidente crítico registrado para este horário e filtro.
                            </div>
                        ) : (
                            riscosFiltrados.map((risco) => (
                                <div key={risco.id} className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex justify-between items-center text-xs transition-colors hover:bg-zinc-900">
                                    <div>
                                        <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide ${
                                            risco.severidade === 'Alta' ? 'text-red-400 bg-red-950/50' : 'text-amber-400 bg-amber-950/50'
                                        }`}>
                                            {risco.tipo}
                                        </span>
                                        <p className="font-semibold text-zinc-200 mt-1.5">{risco.titulo}</p>
                                        <p className="text-zinc-500 text-[10px] mt-0.5">📍 {risco.local}</p>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 whitespace-nowrap pl-2 font-mono">{risco.tempoTexto}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}