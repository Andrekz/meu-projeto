import { NextRequest, NextResponse } from 'next/server';
import { buscarPostosDB, sincronizarPostos } from '../../postos-seguros/actions';
import { pool } from '../../../lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '-25.4296');
  const lon = parseFloat(searchParams.get('lon') || '-49.2675');
  const raio = parseFloat(searchParams.get('raio') || '5000');

  try {
    const [meta] = await pool.query(
      'SELECT COUNT(*) as total, MIN(atualizado_em) as mais_antigo FROM postos_seguros'
    );
    const { total, mais_antigo } = (meta as any[])[0];
    const precisaSincronizar =
      total === 0 ||
      (mais_antigo && new Date(mais_antigo) < new Date(Date.now() - 24 * 60 * 60 * 1000));

    if (precisaSincronizar) {
      await sincronizarPostos(lat, lon, raio);
    }

    const postos = await buscarPostosDB(lat, lon, raio);
    return NextResponse.json({ postos });
  } catch (error: any) {
    console.error('Erro na rota /api/postos-seguros:', error.message);
    return NextResponse.json({ postos: [] }, { status: 500 });
  }
}
