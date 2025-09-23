import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        
        // Clear the session cookie
        cookieStore.delete('session');
        
        return NextResponse.json({ 
            success: true, 
            message: 'Signed out successfully' 
        });
        
    } catch (error) {
        console.error('Signout error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Error signing out' 
        }, { status: 500 });
    }
}