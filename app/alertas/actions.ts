'use server';

import { pool } from '../../lib/db';
import { revalidatePath } from 'next/cache';

export async function buscarOcorrencias(filter?: string, lat?: number, lng?: number) {
  try {
    let query = 'SELECT * FROM ocorrencias';
    let params: any[] = [];

    if (filter === 'verificados') {
      query += ' WHERE verificado = TRUE ORDER BY criado_em DESC';
    } else if (filter === 'proximos' && lat && lng) {
      query += ' ORDER BY (POW(latitude - ?, 2) + POW(longitude - ?, 2)) ASC';
      params = [lat, lng];
    } else {
      query += ' ORDER BY criado_em DESC';
    }

    const [rows] = await pool.query(query, params);
    return rows as any[];
  } catch (error: any) {
    console.error('Erro ao buscar ocorrências:', error.message);
    return [];
  }
}

export async function buscarOcorrenciasComCoordenadas() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ocorrencias WHERE latitude IS NOT NULL AND longitude IS NOT NULL ORDER BY criado_em DESC'
    );
    // MySQL2 retorna DECIMAL como string — converte para number
    return (rows as any[]).map(r => ({
      ...r,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
    }));
  } catch (error: any) {
    console.error('Erro ao buscar ocorrências com coordenadas:', error.message);
    return [];
  }
}

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
    const [result] = await pool.query(
      'INSERT INTO ocorrencias (tipo, titulo, descricao, endereco, bairro) VALUES (?, ?, ?, ?, ?)',
      [tipo, titulo, descricao, endereco, bairro]
    );

    const insertId = (result as any).insertId;

    // Geocoding via Nominatim para que o alerta apareça no mapa
    try {
      const query = `${endereco}, ${bairro}, Curitiba, PR, Brasil`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'IterVigilans-Academic-Project-guiselig10' } }
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        await pool.query(
          'UPDATE ocorrencias SET latitude = ?, longitude = ? WHERE id = ?',
          [parseFloat(lat), parseFloat(lon), insertId]
        );
      }
    } catch {
      // Geocoding falhou — coordenadas permanecem nulas
    }
  } catch (error: any) {
    console.error('Erro ao criar ocorrência:', error.message);
    throw new Error('Erro ao salvar no banco de dados.');
  }

  revalidatePath('/alertas');
  revalidatePath('/mapa');
  revalidatePath('/dashboard');
}

export async function deletarOcorrencia(id: number) {
  try {
    await pool.query('DELETE FROM ocorrencias WHERE id = ?', [id]);
  } catch (error: any) {
    console.error('Erro ao deletar ocorrência:', error.message);
    throw new Error('Erro ao remover o alerta do banco de dados.');
  }

  revalidatePath('/alertas');
  revalidatePath('/mapa');
  revalidatePath('/dashboard');
}

export async function buscarMetricasHoje() {
  try {
    const query = `
      SELECT tipo, COUNT(*) as total
      FROM ocorrencias
      WHERE DATE(criado_em) = CURDATE()
      GROUP BY tipo
    `;

    const [rows] = await pool.query(query);

    const metricas = {
      Assalto: 0,
      Iluminacao: 0,
      ViaDeserta: 0,
      PostoSeguro: 0
    };

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
