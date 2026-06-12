'use server';

import { pool } from '../../lib/db';
import { revalidatePath } from 'next/cache';

// Função para buscar todas as ocorrências do banco
// Caminho do arquivo: app/alertas/actions.ts

export async function buscarOcorrencias(filter?: string, lat?: number, lng?: number) {
  try {
    let query = 'SELECT * FROM ocorrencias';
    let params: any[] = [];

    if (filter === 'verificados') {
      // Filtra apenas os que foram validados pela moderação
      query += ' WHERE verificado = TRUE ORDER BY criado_em DESC';
    } else if (filter === 'proximos' && lat && lng) {
      // Cálculo matemático aproximado de distância (Pitágoras) para ordenar pelo mais próximo
      query += ' ORDER BY (POW(latitude - ?, 2) + POW(longitude - ?, 2)) ASC';
      params = [lat, lng];
    } else {
      // Padrão: Recentes (ordem cronológica)
      query += ' ORDER BY criado_em DESC';
    }

    const [rows] = await pool.query(query, params);
    return rows as any[];
  } catch (error: any) {
    console.error('Erro ao buscar ocorrências:', error.message);
    return [];
  }
}

// Função para salvar uma nova denúncia enviada pelo usuário
export async function criarOcorrencia(formData: FormData) {
  const tipo = formData.get('tipo') as string;
  const titulo = formData.get('titulo') as string;
  const descricao = formData.get('descricao') as string;
  const endereco = formData.get('endereco') as string;
  const bairro = formData.get('bairro') as string;

  if (!tipo || !titulo || !descricao || !endereco || !bairro) {
    throw new Error('Todos os campos são obrigatórios.');
  }

  try {
    await pool.query(
      'INSERT INTO ocorrencias (tipo, titulo, descricao, endereco, bairro) VALUES (?, ?, ?, ?, ?)',
      [tipo, titulo, descricao, endereco, bairro]
    );
  } catch (error: any) {
    console.error('Erro ao criar ocorrência:', error.message);
    throw new Error('Erro ao salvar no banco de dados.');
  }
}

export async function deletarOcorrencia(id: number) {
  try {
    await pool.query('DELETE FROM ocorrencias WHERE id = ?', [id]);
  } catch (error: any) {
    console.error('Erro ao deletar ocorrência:', error.message);
    throw new Error('Erro ao remover o alerta do banco de dados.');
  }

  // Força o Next.js a atualizar as telas na hora
  revalidatePath('/alertas');
  revalidatePath('/dashboard');
}

// ... (mantenha as outras funções: buscarOcorrencias, criarOcorrencia, deletarOcorrencia)

export async function buscarMetricasHoje() {
  try {
    // Busca contagem agrupada por tipo apenas para o dia de hoje
    const query = `
      SELECT tipo, COUNT(*) as total 
      FROM ocorrencias 
      WHERE DATE(criado_em) = CURDATE() 
      GROUP BY tipo
    `;
    
    const [rows] = await pool.query(query);
    
    // Objeto padrão zerado para garantir que a tela não quebre se não houver dados
    const metricas = {
      Assalto: 0,
      Iluminacao: 0,
      ViaDeserta: 0,
      PostoSeguro: 0
    };

    // Mapeia o resultado do banco para o nosso objeto
    (rows as any[]).forEach(row => {
      if (row.tipo === 'Assalto') metricas.Assalto = row.total;
      if (row.tipo === 'Iluminação') metricas.Iluminacao = row.total;
      if (row.tipo === 'Via deserta') metricas.ViaDeserta = row.total;
      if (row.tipo === 'Posto Seguro') metricas.PostoSeguro = row.total;
    });

    return metricas;
  } catch (error: any) {
    console.error('Erro ao buscar métricas de hoje:', error.message);
    return { Assalto: 0, Iluminacao: 0, ViaDeserta: 0, PostoSeguro: 0 };
  }
}