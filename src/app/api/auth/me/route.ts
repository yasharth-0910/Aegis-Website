import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');
        
        if (!sessionCookie) {
            return NextResponse.json({ 
                success: false, 
                message: 'Not authenticated' 
            }, { status: 401 });
        }
        
        try {
            // Decode the session token
            const sessionData = JSON.parse(atob(sessionCookie.value));
            
            // Check if session is still valid (not expired)
            const sessionAge = Date.now() - sessionData.loginTime;
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            
            if (sessionAge > maxAge) {
                // Session expired
                cookieStore.delete('session');
                return NextResponse.json({ 
                    success: false, 
                    message: 'Session expired' 
                }, { status: 401 });
            }
            
            return NextResponse.json({ 
                success: true, 
                user: {
                    id: sessionData.userId,
                    fullname: sessionData.fullname,
                    email: sessionData.email
                }
            });
            
        } catch (decodeError) {
            // Invalid session token
            cookieStore.delete('session');
            return NextResponse.json({ 
                success: false, 
                message: 'Invalid session' 
            }, { status: 401 });
        }
        
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal Server Error' 
        }, { status: 500 });
    }
}