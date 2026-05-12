// app/api/user-actions/route.ts
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, token, ...data } = body;

    if (action === 'update-alias') {
      const targetUrl = `https://centralbank.brocoly.cc/api/persons/${data.cbu}/alias`;
      
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-environment': 'test',
          'x-api-key': '7b44da11-8020-4dfd-b1dc-fa7873114e94' // Inyectada directamente
        },
        body: JSON.stringify({ alias: data.alias }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: 'INVALID_ACTION' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'INTERNAL_ERROR' }, { status: 500 });
  }
}