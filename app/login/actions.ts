'use server';

import { pool } from '../../lib/db';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; // 1. Importa os cookies

export async function loginUsuario(formData: FormData) {
  const email = formData.get('email') as string;
  const senha = formData.get('senha') as string;

  if (!email || !senha) {
    throw new Error('Por favor, preencha todos os campos.');
  }

  try {
    const [rows]: any = await pool.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const usuario = rows[0];

    if (usuario.senha !== senha) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // 2. Guarda o nome do utilizador num Cookie seguro
    const cookieStore = await cookies();
    cookieStore.set('usuario_nome', usuario.nome, {
      httpOnly: true, // Segurança: impede que scripts maliciosos acessem o cookie
      maxAge: 60 * 60 * 24, // O login expira em 1 dia (em segundos)
      path: '/',
    });

  } catch (error: any) {
    console.error('Erro ao fazer login:', error.message);
    throw new Error(error.message || 'Erro interno no servidor.');
  }

  redirect('/dashboard');
}