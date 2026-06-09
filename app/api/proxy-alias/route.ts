import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const { cbu, alias, token } = await request.json();

    const response = await fetch(`https://centralbank.brocoly.cc/api/persons/${cbu}/alias`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-environment': 'test',
        'x-api-key': token,
      },
      body: JSON.stringify({ alias }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ message: 'INTERNAL_PROXY_ERROR' }, { status: 500 });
  }
}
