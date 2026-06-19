'use server';

import { pool } from '../../lib/db';

export interface PostoSeguro {
  id: number;
  nome: string;
  tipo: 'policial' | 'hospital';
  latitude: number;
  longitude: number;
  endereco: string | null;
}

export async function buscarPostosDB(lat = -25.4296, lon = -49.2675, raioMetros = 5000): Promise<PostoSeguro[]> {
  try {
    const [rows] = await pool.query(
      `SELECT *,
        (6371000 * 2 * ASIN(SQRT(
          POWER(SIN((latitude - ?) * PI() / 180 / 2), 2) +
          COS(latitude * PI() / 180) * COS(? * PI() / 180) *
          POWER(SIN((longitude - ?) * PI() / 180 / 2), 2)
        ))) AS distancia
       FROM postos_seguros
       HAVING distancia <= ?
       ORDER BY distancia`,
      [lat, lat, lon, raioMetros]
    );
    // MySQL2 retorna DECIMAL como string — converte para number
    return (rows as any[]).map(r => ({
      ...r,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
    })) as PostoSeguro[];
  } catch (error: any) {
    console.error('Erro ao buscar postos do banco:', error.message);
    return [];
  }
}

export async function sincronizarPostos(lat = -25.4296, lon = -49.2675, raioMetros = 5000): Promise<void> {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="police"](around:${raioMetros},${lat},${lon});
      way["amenity"="police"](around:${raioMetros},${lat},${lon});
      node["amenity"="hospital"](around:${raioMetros},${lat},${lon});
      way["amenity"="hospital"](around:${raioMetros},${lat},${lon});
      node["amenity"="clinic"](around:${raioMetros},${lat},${lon});
      node["amenity"="doctors"](around:${raioMetros},${lat},${lon});
    );
    out center;
  `;

  try {
    const res = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { next: { revalidate: 0 } }
    );

    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) return;

    const dados = await res.json();
    if (!dados.elements?.length) return;

    for (const el of dados.elements) {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      if (!elLat || !elLon) continue;

      const amenity = el.tags?.amenity;
      const tipo: 'policial' | 'hospital' = amenity === 'police' ? 'policial' : 'hospital';
      const nome = el.tags?.name || (tipo === 'policial' ? 'Delegacia / Posto Policial' : 'Unidade de Saúde');
      const endereco = el.tags?.['addr:street']
        ? `${el.tags['addr:street']}${el.tags['addr:housenumber'] ? ', ' + el.tags['addr:housenumber'] : ''}`
        : null;

      await pool.query(
        `INSERT INTO postos_seguros (id, nome, tipo, latitude, longitude, endereco, atualizado_em)
         VALUES (?, ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           nome = VALUES(nome),
           tipo = VALUES(tipo),
           latitude = VALUES(latitude),
           longitude = VALUES(longitude),
           endereco = VALUES(endereco),
           atualizado_em = NOW()`,
        [el.id, nome, tipo, elLat, elLon, endereco]
      );
    }
  } catch (error: any) {
    console.error('Erro ao sincronizar postos via Overpass:', error.message);
  }
}

export async function buscarOuSincronizarPostos(lat = -25.4296, lon = -49.2675, raioMetros = 5000): Promise<PostoSeguro[]> {
  // Verifica se há dados recentes (< 24h) no banco
  try {
    const [meta] = await pool.query(
      `SELECT COUNT(*) as total, MIN(atualizado_em) as mais_antigo FROM postos_seguros`
    );
    const { total, mais_antigo } = (meta as any[])[0];
    const precisaSincronizar = total === 0 || (mais_antigo && new Date(mais_antigo) < new Date(Date.now() - 24 * 60 * 60 * 1000));

    if (precisaSincronizar) {
      await sincronizarPostos(lat, lon, raioMetros);
    }
  } catch {
    // Tabela pode não existir ainda — tenta sincronizar mesmo assim
    try { await sincronizarPostos(lat, lon, raioMetros); } catch {}
  }

  return buscarPostosDB(lat, lon, raioMetros);
}
