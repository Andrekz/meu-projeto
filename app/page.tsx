import Link from 'next/link'; 

export default function Home() {
  return (
    // min-h-screen: garante altura total da tela
    // flex: ativa o flexbox
    // flex-col: empilha os itens (título em cima, botão embaixo)
    // items-center: centraliza horizontalmente
    // justify-center: centraliza verticalmente
    <div className="bg-black min-h-screen w-full text-white flex flex-col items-center justify-center">
      
      
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">
          Seja bem-vindo ao nosso site!
        </h1>
        
        <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
          Fazer login
        </Link>
      </div>
      
    </div>
  );
}