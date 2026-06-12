import Link from 'next/link';
import { buscarOcorrencias, deletarOcorrencia, buscarMetricasHoje } from './actions'; // Importado buscarMetricasHoje
import ModalDenuncia from './ModalDenuncia';
import Filtros from './Filtros';

interface PageProps {
    searchParams: Promise<{ filter?: string; lat?: string; lng?: string }>;
}

export default async function Alertas({ searchParams }: PageProps) {
    const params = await searchParams;
    const filter = params.filter;
    const lat = params.lat ? Number(params.lat) : undefined;
    const lng = params.lng ? Number(params.lng) : undefined;

    // Busca dados em paralelo no banco MySQL
    const ocorrencias = await buscarOcorrencias(filter, lat, lng);
    const metricas = await buscarMetricasHoje(); // Dados reais dos gráficos das colunas laterais

    async function handleDeletar(formData: FormData) {
        'use server';
        const id = Number(formData.get('id'));
        await deletarOcorrencia(id);
    }

    // Função auxiliar simples para calcular a porcentagem da barra (considerando uma escala visual máxima de 5 itens por barra)
    const calcularPorcentagem = (total: number) => {
        return `${Math.min((total / 5) * 100, 100)}%`;
    };

    return (
        <div className="bg-black min-h-screen text-white flex">
            {/* MENU LATERAL */}
            <aside className="w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col min-h-screen">
                {/* Logo / Título */}
                <div className="text-xl font-bold text-emerald-500 tracking-wider mb-6">
                    ITER VIGILANS
                </div>

                {/* Links de Navegação */}
                <nav className="flex flex-col gap-2">
                    <Link href="/dashboard" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
                        <span>🏠</span> Página Inicial
                    </Link>
                    <Link href="/alertas" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
                        <span>🚨</span> Alertas & Denúncias
                    </Link>
                    <Link href="/mapa" className="text-zinc-400 hover:bg-zinc-900 hover:text-white px-4 py-3 rounded-xl transition-all flex items-center gap-3">
                        <span>📍</span> Mapa de Risco
                    </Link>
                </nav>

                {/* BOTÃO DE SAIR (Fixado lá embaixo) */}
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

            {/* CONTEÚDO */}
            <main className="flex-1 p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLUNA ESQUERDA: LISTAGEM */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <header>
                        <h1 className="text-3xl font-serif font-bold">Alertas & Denúncias</h1>
                        <p className="text-zinc-400 text-sm mt-1">Curitiba · Centro e arredores · atualizado agora</p>
                    </header>

                    <Filtros />

                    <div className="flex flex-col gap-4">
                        {ocorrencias.length === 0 ? (
                            <p className="text-zinc-500 text-sm italic p-8 border border-dashed border-zinc-800 rounded-2xl text-center">
                                Nenhum alerta encontrado para o filtro selecionado.
                            </p>
                        ) : (
                            ocorrencias.map((item) => {
                                const IsAssalto = item.tipo === 'Assalto';
                                const IsIluminacao = item.tipo === 'Iluminação';

                                return (
                                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex gap-4 relative group">
                                        <span className={`text-3xl p-3 rounded-xl h-fit ${IsAssalto ? 'bg-red-950/50 text-red-500' : IsIluminacao ? 'bg-amber-950/50 text-amber-500' : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                                            {IsAssalto ? '🚨' : IsIluminacao ? '💡' : '⚠️'}
                                        </span>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className={`border text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${IsAssalto ? 'bg-red-950 text-red-400 border-red-900' : IsIluminacao ? 'bg-amber-950 text-amber-400 border-amber-900' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                        }`}>
                                                        {item.tipo}
                                                    </span>
                                                    <h3 className="text-lg font-bold mt-2">{item.titulo}</h3>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-zinc-500">Recente</span>
                                                    <form action={handleDeletar}>
                                                        <input type="hidden" name="id" value={item.id} />
                                                        <button
                                                            type="submit"
                                                            className="text-zinc-600 hover:text-red-400 p-1 rounded-md hover:bg-zinc-800 transition-colors text-sm"
                                                            title="Eliminar este alerta"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>

                                            <p className="text-zinc-400 text-sm mt-2 max-w-xl">
                                                {item.descricao}
                                            </p>

                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800/60">
                                                <span className="text-xs text-zinc-500">📍 {item.endereco} · {item.bairro}</span>
                                                <div className="flex gap-4 items-center">
                                                    <button className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                                                        👍 <span className="text-emerald-400 font-bold">{item.votos}</span>
                                                    </button>
                                                    {item.verificado ? (
                                                        <span className="text-xs text-emerald-500 flex items-center gap-1">✅ Verificado</span>
                                                    ) : (
                                                        <span className="text-xs text-zinc-500">Aguardando análise</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* COLUNA DIREITA: COMPONENTE DE MÉTRICAS AGORA DINÂMICO */}
                <div className="flex flex-col gap-6 lg:pt-16">

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                        <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-5">Tipos de ocorrência hoje</h3>

                        <div className="flex flex-col gap-4">
                            {/* Barra de Assaltos */}
                            <div>
                                <div className="flex justify-between text-sm text-zinc-300 mb-1.5">
                                    <span>🚨 Assaltos</span> <span className="font-bold">{metricas.Assalto}</span>
                                </div>
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-red-500 h-full transition-all duration-500"
                                        style={{ width: calcularPorcentagem(metricas.Assalto) }}
                                    ></div>
                                </div>
                            </div>

                            {/* Barra de Iluminação */}
                            <div>
                                <div className="flex justify-between text-sm text-zinc-300 mb-1.5">
                                    <span>💡 Iluminação</span> <span className="font-bold">{metricas.Iluminacao}</span>
                                </div>
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-amber-500 h-full transition-all duration-500"
                                        style={{ width: calcularPorcentagem(metricas.Iluminacao) }}
                                    ></div>
                                </div>
                            </div>

                            {/* Barra de Via Deserta */}
                            <div>
                                <div className="flex justify-between text-sm text-zinc-300 mb-1.5">
                                    <span>⚠️ Vias Desertas</span> <span className="font-bold">{metricas.ViaDeserta}</span>
                                </div>
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-zinc-500 h-full transition-all duration-500"
                                        style={{ width: calcularPorcentagem(metricas.ViaDeserta) }}
                                    ></div>
                                </div>
                            </div>

                            {/* Barra de Posto Seguro */}
                            <div>
                                <div className="flex justify-between text-sm text-zinc-300 mb-1.5">
                                    <span>🏥 Postos Seguros</span> <span className="font-bold">{metricas.PostoSeguro}</span>
                                </div>
                                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full transition-all duration-500"
                                        style={{ width: calcularPorcentagem(metricas.PostoSeguro) }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card de Horários (Estático por enquanto) */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                        <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase mb-4">Índice por horário</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                                <span className="text-zinc-400">06h–12h</span> <span className="text-emerald-500 font-medium">Baixo</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                                <span className="text-zinc-400">12h–18h</span> <span className="text-amber-500 font-medium">Moderado</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800">
                                <span className="text-zinc-400">18h–00h</span> <span className="text-red-500 font-medium">Alto</span>
                            </div>
                        </div>
                    </div>

                    <ModalDenuncia />
                </div>

            </main>
        </div>
    );
}