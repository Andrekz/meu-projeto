export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Home, AlertTriangle, MapPin, LogOut } from 'lucide-react';
import { buscarOcorrenciasDoMapa } from './actions';
import MapaRiscoContent from './MapaRiscoContent';

export default async function MapaRisco() {
  const ocorrencias = await buscarOcorrenciasDoMapa();

  return (
    <div className="bg-black min-h-screen text-white flex">
      {/* MENU LATERAL */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col min-h-screen shrink-0 hidden md:flex">
        <div className="text-xl font-bold text-emerald-500 tracking-wider mb-6 font-mono">
          ITER VIGILANS
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
            <Home size={16} /> Página Inicial
          </Link>
          <Link href="/alertas" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
            <AlertTriangle size={16} /> Alertas &amp; Denúncias
          </Link>
          <Link href="/mapa" className="text-zinc-200 bg-zinc-900/60 px-4 py-3 rounded-xl flex items-center gap-3 border border-zinc-800/40">
            <MapPin size={16} /> Mapa de Risco
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-900">
          <Link
            href="/"
            className="w-full bg-zinc-900/50 hover:bg-red-950/30 border border-zinc-800/60 hover:border-red-900/50 text-zinc-400 hover:text-red-400 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group"
          >
            <LogOut size={15} className="group-hover:translate-x-0.5 transition-transform" />
            Sair da conta
          </Link>
        </div>
      </aside>

      <MapaRiscoContent ocorrencias={ocorrencias} />
    </div>
  );
}
