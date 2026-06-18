'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { OcorrenciaMapa } from './ComponenteMapaReal';

const ComponenteMapaReal = dynamic(() => import('./ComponenteMapaReal'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-zinc-950 flex items-center justify-center">
      <span className="text-zinc-500 text-xs font-mono animate-pulse">Sincronizando malha tática de Curitiba...</span>
    </div>
  ),
});

const FILTROS = [
  { id: 'Todos', label: 'Todos' },
  { id: 'Assaltos', label: 'Assaltos' },
  { id: 'Iluminação', label: 'Iluminação' },
  { id: 'Via deserta', label: 'Via deserta' },
];

function getSeveridade(tipo: string) {
  return tipo === 'Assalto' || tipo === 'Furto' ? 'Alta' : 'Média';
}

interface Props {
  ocorrencias: OcorrenciaMapa[];
}

export default function MapaRiscoContent({ ocorrencias }: Props) {
  const [posicaoUsuario, setPosicaoUsuario] = useState<[number, number] | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [horaTexto, setHoraTexto] = useState('');

  useEffect(() => {
    const agora = new Date();
    const h = agora.getHours();
    const m = agora.getMinutes().toString().padStart(2, '0');
    setHoraTexto(`Centro · Curitiba · ${h}h${m}`);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setPosicaoUsuario([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const ocorrenciasFiltradas = ocorrencias.filter(o => {
    if (filtroAtivo === 'Todos') return true;
    if (filtroAtivo === 'Assaltos') return o.tipo === 'Assalto';
    if (filtroAtivo === 'Iluminação') return o.tipo === 'Iluminação';
    if (filtroAtivo === 'Via deserta') return o.tipo === 'Via deserta';
    return true;
  });

  return (
    <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-screen overflow-hidden">
      {/* MAPA */}
      <div className="lg:col-span-8 relative bg-zinc-950 flex flex-col h-full">
        {/* Busca e filtros */}
        <div className="absolute top-6 left-6 right-6 z-20 flex flex-col gap-3 max-w-xl">
          <div className="bg-zinc-900/95 border border-zinc-800 p-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
            <svg className="w-4 h-4 text-zinc-500 ml-2 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar endereço, bairro..."
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
            {FILTROS.map(btn => (
              <button
                key={btn.id}
                onClick={() => setFiltroAtivo(btn.id)}
                className={`text-xs px-3 py-1.5 rounded-full cursor-pointer font-medium transition-all whitespace-nowrap border ${
                  filtroAtivo === btn.id
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative z-10 h-full">
          <ComponenteMapaReal ocorrencias={ocorrenciasFiltradas} posicaoUsuario={posicaoUsuario} />
        </div>
      </div>

      {/* PAINEL LATERAL */}
      <div className="lg:col-span-4 bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto h-full">
        <header>
          <h2 className="text-2xl font-serif font-bold">Mapa de Risco</h2>
          <p className="text-zinc-500 text-xs mt-0.5 font-mono">{horaTexto || 'Curitiba'}</p>
        </header>

        {/* Legenda */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2.5">
          <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Legenda</h4>
          <div className="flex justify-between text-xs items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-zinc-300">Alto risco (Assalto/Furto)</span>
            </div>
            <span className="text-zinc-500 font-medium font-mono">
              {ocorrenciasFiltradas.filter(o => getSeveridade(o.tipo) === 'Alta').length} zonas
            </span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-zinc-300">Atenção moderada</span>
            </div>
            <span className="text-zinc-500 font-medium font-mono">
              {ocorrenciasFiltradas.filter(o => getSeveridade(o.tipo) !== 'Alta').length} zonas
            </span>
          </div>
          {ocorrencias.length === 0 && (
            <p className="text-[10px] text-zinc-600 mt-1">
              Nenhuma ocorrência georreferenciada ainda. Adicione denúncias com endereço para elas aparecerem aqui.
            </p>
          )}
        </div>

        {/* Lista de incidentes */}
        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            Incidentes do banco de dados ({ocorrenciasFiltradas.length})
          </h4>

          {ocorrenciasFiltradas.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-600">
              Nenhuma ocorrência encontrada para este filtro.
            </div>
          ) : (
            ocorrenciasFiltradas.map(o => (
              <div
                key={o.id}
                className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex justify-between items-center text-xs hover:bg-zinc-900 transition-colors"
              >
                <div>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide ${
                    getSeveridade(o.tipo) === 'Alta'
                      ? 'text-red-400 bg-red-950/50'
                      : 'text-amber-400 bg-amber-950/50'
                  }`}>
                    {o.tipo}
                  </span>
                  <p className="font-semibold text-zinc-200 mt-1.5">{o.titulo}</p>
                  <p className="text-zinc-500 text-[10px] mt-0.5">{o.endereco} · {o.bairro}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
