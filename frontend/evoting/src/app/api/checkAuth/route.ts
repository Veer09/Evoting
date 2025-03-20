import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookie = request.headers.get('cookie');
  if (!cookie || !cookie.includes('token=')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch('http://localhost:3000/verifyToken', {
      method: 'GET',
      headers: {
        'Cookie': cookie,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}