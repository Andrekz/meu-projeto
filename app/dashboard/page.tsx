import Link from 'next/link';
import { cookies } from 'next/headers';
import DashboardDinamico from './DashboardDinamico';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const nomeUsuario = cookieStore.get('usuario_nome')?.value || 'Luis Gustavo';

    // Determina saudação realista com base no horário real do servidor/usuário
    const horaAtual = new Date().getHours();
    let saudacao = 'Boa noite';
    if (horaAtual >= 5 && horaAtual < 12) saudacao = 'Bom dia';
    else if (horaAtual >= 12 && horaAtual < 18) saudacao = 'Boa tarde';

    // Formata a data atual por extenso
    const dataExtenso = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-black min-h-screen text-white flex overflow-hidden">

            {/* MENU LATERAL */}
            <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col min-h-screen shrink-0 select-none">
                <div className="text-xl font-bold text-emerald-500 tracking-wider mb-6 font-mono">
                    ITER VIGILANS
                </div>

                <nav className="flex flex-col gap-2">
                    <Link href="/dashboard" className="bg-zinc-900 text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3 font-medium border border-zinc-800/50">
                        <span>🏠</span> Página Inicial
                    </Link>
                    <Link href="/alertas" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
                        <span>🚨</span> Alertas & Denúncias
                    </Link>
                    <Link href="/mapa" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
                        <span>📍</span> Mapa de Risco
                    </Link>
                </nav>

                <div className="mt-auto pt-6 border-t border-zinc-900">
                    <Link
                        href="/"
                        className="w-full bg-zinc-900/50 hover:bg-red-950/30 border border-zinc-800/60 hover:border-red-900/50 text-zinc-400 hover:text-red-400 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group"
                    >
                        <span className="text-base group-hover:translate-x-0.5 transition-transform">🚪</span>
                        Sair da conta
                    </Link>
                </div>
            </aside>

            {/* CONTEÚDO PRINCIPAL */}
            <main className="flex-1 p-8 overflow-y-auto h-screen max-w-[calc(100vw-16rem)]">
                {/* Cabeçalho dinâmico */}
                <header className="mb-8 select-none">
                    <h1 className="text-3xl font-serif font-bold text-zinc-100">{saudacao}, {nomeUsuario}.</h1>
                    <p className="text-zinc-400 text-sm mt-1 capitalize">Curitiba · {dataExtenso}</p>
                </header>

                {/* Estrutura Dinâmica em Tempo Real */}
                <DashboardDinamico />
            </main>
        </div>
    );
}