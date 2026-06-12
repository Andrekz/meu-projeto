import Link from 'next/link';
import { loginUsuario } from './actions'; 

export default function Login() {
  return (
    <div className="bg-black min-h-screen w-full text-white flex flex-col items-center justify-center px-4 relative overflow-hidden select-none">
      
      {/* Luz sutil de fundo para dar profundidade */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-950/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Card do Formulário */}
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800/80 shadow-2xl z-10">

        <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">
          Acessar Conta
        </h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          Bem-vindo de volta! Insira seus dados abaixo.
        </p>

        <form action={loginUsuario} className="flex flex-col gap-5">

          {/* Campo E-mail */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="seu@email.com"
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              required
            />
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="senha" className="text-sm font-medium text-zinc-300">
                Senha
              </label>
              <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                Esqueceu a senha?
              </a>
            </div>
            <input
              type="password"
              id="senha"
              name="senha"
              placeholder="••••••••"
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
              required
            />
          </div>

          {/* Botão de Enviar */}
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-950/50 mt-2 transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            Entrar
          </button>
        </form>

        {/* Link para quem NÃO tem conta */}
        <p className="text-zinc-400 text-center text-sm mt-6">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Cadastre-se
          </Link>
        </p>

      </div>

      {/* Botão para voltar à Home */}
      <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm mt-6 transition-colors z-10 flex items-center gap-1.5 group">
        <span className="group-hover:-translate-x-0.5 transition-transform">←</span> Voltar para o início
      </Link>

    </div>
  );
}