'use server';

// Trocamos o '@/' por '../../' para garantir que ele encontre a pasta lib
import { pool } from '../../lib/db';
import { redirect } from 'next/navigation';

export async function cadastrarUsuario(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;

  if (!nome || !email || !senha) {
    throw new Error('Todos os campos são obrigatórios.');
  }

  try {
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );
  } catch (error: any) {
    console.error('Erro ao salvar no banco:', error);
    throw new Error('Erro ao criar conta.');
  }

  redirect('/login');
}