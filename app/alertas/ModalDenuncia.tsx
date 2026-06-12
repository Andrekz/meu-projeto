'use client';

import { useState } from 'react';
import { criarOcorrencia } from './actions';

export default function ModalDenuncia() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErro('');
    try {
      await criarOcorrencia(formData);
      setIsOpen(false); // Fecha o modal se correr tudo bem
    } catch (err: any) {
      setErro(err.message || 'Erro ao enviar denúncia.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* O BOTÃO QUE JÁ TINHAMOS NO LAYOUT, AGORA COM EVENTO CLICK */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors mt-auto flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 w-full"
      >
        📢 Fazer nova denúncia
      </button>

      {/* JANELA DO MODAL (SÓ APARECE SE ISOPEN FOR TRUE) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-serif text-white">Relatar Nova Ocorrência</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-zinc-400 hover:text-white text-sm bg-zinc-800 hover:bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {erro && (
              <p className="bg-red-950 border border-red-900 text-red-400 p-3 rounded-xl text-sm mb-4">
                ⚠️ {erro}
              </p>
            )}

            <form action={handleSubmit} className="flex flex-col gap-4">
              
              {/* Tipo de Ocorrência */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tipo</label>
                <select 
                  name="tipo" 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                >
                  <option value="Assalto">🚨 Assalto</option>
                  <option value="Iluminação">💡 Iluminação precária</option>
                  <option value="Via deserta">⚠️ Via deserta / Sem movimento</option>
                  <option value="Posto Seguro">🏥 Posto Seguro / Apoio</option>
                </select>
              </div>

              {/* Título */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Título Resumido</label>
                <input 
                  type="text" 
                  name="titulo" 
                  placeholder="Ex: Assalto próximo ao ponto de ônibus"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              {/* Descrição */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">O que aconteceu?</label>
                <textarea 
                  name="descricao" 
                  rows={3}
                  placeholder="Dê detalhes do ocorrido para ajudar outros utilizadores..."
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  required
                ></textarea>
              </div>

              {/* Grid Endereço e Bairro */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Endereço / Rua</label>
                  <input 
                    type="text" 
                    name="endereco" 
                    placeholder="Ex: R. XV de Novembro, 100"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bairro</label>
                  <input 
                    type="text" 
                    name="bairro" 
                    placeholder="Ex: Centro"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? 'A enviar...' : 'Publicar Alerta'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}