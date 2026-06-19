'use server';

import { pool } from '../../lib/db';

export interface OcorrenciaDoMapa {
  id: number;
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  verificado: boolean;
  votos: number;
  criado_em: string;
}

export async function buscarOcorrenciasDoMapa(): Promise<OcorrenciaDoMapa[]> {
  try {
    const [rows] = await pool.query(
      `SELECT id, tipo, titulo, descricao, endereco, bairro,
              latitude, longitude, verificado, votos, criado_em
       FROM ocorrencias
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
       ORDER BY criado_em DESC`
    );

    // MySQL2 retorna DECIMAL como string — converte para number
    return (rows as any[]).map(r => ({
      ...r,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      verificado: Boolean(r.verificado),
      votos: Number(r.votos),
    }));
  } catch (error: any) {
    console.error('Erro ao buscar ocorrências do mapa:', error.message);
    return [];
  }
}
