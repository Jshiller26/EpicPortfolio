import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    const correctPassword = process.env.SYSTEM_PASSWORD;
    
    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
