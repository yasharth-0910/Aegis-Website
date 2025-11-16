import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    const result = await pool.query(
      'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email',
      [fullName, email, password]
    );

    const user = result.rows[0];
    
    // Create a simple token (in production, use JWT)
    const token = Buffer.from(user.id + ':' + email).toString('base64');

    return NextResponse.json({ 
      success: true, 
      userId: user.id,
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
      }
    });
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}