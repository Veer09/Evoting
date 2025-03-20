import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

  response.cookies.set('token', '', { 
    expires: new Date(0),
    path: '/',
  });
  
  return response;
}