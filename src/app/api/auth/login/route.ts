import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        
        // Validate required fields
        if (!email || !password) {
            return NextResponse.json({ 
                success: false, 
                message: 'Email and password are required' 
            }, { status: 400 });
        }
        
        // Find user by email
        const result = await pool.query(
            'SELECT id, fullname, email, password FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid email or password' 
            }, { status: 401 });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid email or password' 
            }, { status: 401 });
        }
        
        // Create a simple session token (in production, use proper JWT)
        const sessionToken = btoa(JSON.stringify({ 
            userId: user.id, 
            email: user.email, 
            fullname: user.fullname,
            loginTime: Date.now()
        }));
        
        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });
        
        return NextResponse.json({ 
            success: true, 
            message: 'Login successful',
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal Server Error' 
        }, { status: 500 });
    }
}