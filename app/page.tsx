import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-black min-h-screen w-full text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Efeito sutil de luz ao fundo (Glow Premium) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-950/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Container de Conteúdo centralizado e animado */}
      <div className="flex flex-col items-center max-w-2xl z-10 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Badge superior de Identidade */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-6">
          🛡️ ITER VIGILANS · Segurança Colaborativa
        </div>

        {/* Título de Impacto */}
        <h1 className="text-4xl sm:text-5xl font-bold font-serif leading-tight tracking-tight mb-4">
          Sua cidade mais segura, <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            monitorada por você.
          </span>
        </h1>

        {/* Proposta de Valor do seu Projeto */}
        <p className="text-zinc-400 text-sm sm:text-base max-w-md leading-relaxed mb-10">
          Acesse alertas em tempo real, colabore com denúncias no seu bairro e descubra as rotas mais seguras para caminhar ou transitar.
        </p>

        {/* Grupo de Botões Alinhados (Lado a lado no computador, empilhados no celular) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          
          {/* Ação Principal: Criar Conta */}
          <Link 
            href="/cadastro" 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40 text-sm text-center transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Começar agora 
          </Link>
          
          {/* Ação Secundária: Login */}
          <Link 
            href="/login" 
            className="flex-1 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium px-8 py-3.5 rounded-xl transition-all text-sm text-center transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Fazer login
          </Link>

        </div>

      </div>

      {/* Pequeno rodapé institucional discreto */}
      <footer className="absolute bottom-6 text-xs text-zinc-600 tracking-wide z-10">
        &copy; {new Date().getFullYear()} ITER VIGILANS. Todos os direitos reservados.
      </footer>

    </div>
  );
}