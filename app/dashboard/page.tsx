import Link from 'next/link';
import { cookies } from 'next/headers';
import { Home, AlertTriangle, MapPin, LogOut } from 'lucide-react';
import DashboardDinamico from './DashboardDinamico';
import { buscarOcorrencias } from '../alertas/actions';
import { buscarOuSincronizarPostos } from '../postos-seguros/actions';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const nomeUsuario = cookieStore.get('usuario_nome')?.value || 'Luis Gustavo';

  const horaAtual = new Date().getHours();
  let saudacao = 'Boa noite';
  if (horaAtual >= 5 && horaAtual < 12) saudacao = 'Bom dia';
  else if (horaAtual >= 12 && horaAtual < 18) saudacao = 'Boa tarde';

  const dataExtenso = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Busca dados iniciais do banco para pré-popular o dashboard
  const [ocorrencias, postos] = await Promise.all([
    buscarOcorrencias().catch(() => []),
    buscarOuSincronizarPostos().catch(() => []),
  ]);

  return (
    <div className="bg-black min-h-screen text-white flex overflow-hidden">
      {/* MENU LATERAL */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col min-h-screen shrink-0 select-none">
        <div className="text-xl font-bold text-emerald-500 tracking-wider mb-6 font-mono">
          ITER VIGILANS
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="bg-zinc-900 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium border border-zinc-800/50">
            <Home size={16} /> Página Inicial
          </Link>
          <Link href="/alertas" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
            <AlertTriangle size={16} /> Alertas &amp; Denúncias
          </Link>
          <Link href="/mapa" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto h-screen max-w-[calc(100vw-16rem)]">
        <header className="mb-8 select-none">
          <h1 className="text-3xl font-serif font-bold text-zinc-100">{saudacao}, {nomeUsuario}.</h1>
          <p className="text-zinc-400 text-sm mt-1 capitalize">Curitiba · {dataExtenso}</p>
        </header>

        <DashboardDinamico ocorrenciasIniciais={ocorrencias} postosIniciais={postos} />
      </main>
    </div>
  );
}
