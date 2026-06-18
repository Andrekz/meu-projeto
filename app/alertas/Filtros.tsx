'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Filtros() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter') || 'recentes';
  const [localizando, setLocalizando] = useState(false);

  const alterarFiltro = (novoFiltro: string) => {
    if (novoFiltro === 'recentes') {
      router.push('/alertas'); // Limpa a URL voltando ao padrão
    } else if (novoFiltro === 'verificados') {
      router.push('/alertas?filter=verificados');
    } else if (novoFiltro === 'proximos') {
      setLocalizando(true);

      if (!navigator.geolocation) {
        alert('O seu navegador não suporta geolocalização.');
        setLocalizando(false);
        return;
      }

      // Captura as coordenadas do navegador em tempo real
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Passa a localização atual diretamente para a URL
          router.push(`/alertas?filter=proximos&lat=${latitude}&lng=${longitude}`);
          setLocalizando(false);
        },
        (error) => {
          console.error(error);
          alert('Não foi possível obter a sua localização. Verifique as permissões do seu navegador.');
          setLocalizando(false);
        }
      );
    }
  };

  return (
    <div className="flex gap-3">
      {/* Botão Recentes */}
      <button 
        onClick={() => alterarFiltro('recentes')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          currentFilter === 'recentes' 
            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
            : 'bg-zinc-900 text-zinc-400 hover:text-white'
        }`}
      >
        Recentes
      </button>

      {/* Botão Próximos a mim */}
      <button 
        onClick={() => alterarFiltro('proximos')}
        disabled={localizando}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          currentFilter === 'proximos' 
            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
            : 'bg-zinc-900 text-zinc-400 hover:text-white'
        }`}
      >
        {localizando ? 'Localizando...' : 'Próximos a mim'}
      </button>

      {/* Botão Verificados */}
      <button 
        onClick={() => alterarFiltro('verificados')}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          currentFilter === 'verificados' 
            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
            : 'bg-zinc-900 text-zinc-400 hover:text-white'
        }`}
      >
        Verificados
      </button>
    </div>
  );
}