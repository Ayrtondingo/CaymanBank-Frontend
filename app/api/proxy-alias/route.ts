// app/api/proxy-alias/route.ts
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const { cbu, alias, token } = await request.json();

    const response = await fetch(`https://centralbank.brocoly.cc/api/persons/${cbu}/alias`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-environment': 'test', // Configurado para entorno TEST
        'x-api-key': token,      // Tu clave secreta
      },
      body: JSON.stringify({ alias }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
<<<<<<< HEAD
  } catch {
    return NextResponse.json({ message: 'INTERNAL_PROXY_ERROR' }, { status: 500 });
  }
}
=======
  } catch (error) {
    return NextResponse.json({ message: 'INTERNAL_PROXY_ERROR' }, { status: 500 });
  }
}
>>>>>>> 5f796dd4beb798b55b4a140018bb6ca1f1a2b39d
