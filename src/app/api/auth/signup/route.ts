import { NextResponse } from 'next/server';
import pool, { initdb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        // Initialize database tables if they don't exist
        await initdb();
        
        const { fullname, email, password } = await request.json();
        
        // Validate required fields
        if (!fullname || !email || !password) {
            return NextResponse.json({ 
                success: false, 
                message: 'All fields are required' 
            }, { status: 400 });
        }
        
        // Insert user into database
        const result = await pool.query(
            'INSERT INTO users (fullname, email, password) VALUES ($1, $2, $3) RETURNING id, fullname, email, created_at',
            [fullname, email, password]
        );

        return NextResponse.json({ 
            success: true, 
            userId: result.rows[0].id,
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle duplicate email error
        if ((error as any).code === '23505') {
            return NextResponse.json({ 
                success: false, 
                message: 'Email already exists' 
            }, { status: 409 });
        }
        
        return NextResponse.json({ 
            success: false, 
            message: 'Internal Server Error' 
        }, { status: 500 });
    }
}