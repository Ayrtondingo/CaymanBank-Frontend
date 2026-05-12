// frontend/lib/api.ts

// Usamos export para que los otros componentes puedan importar esta URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getBankingData(token: string) {
  // Usamos la constante que definimos arriba
  const response = await fetch(`${API_URL}/users/me`, { 
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo conectar con el banco`);
  }

  return response.json();
}

export async function getTransactionHistory(token: string) {
  const response = await fetch(`${API_URL}/transactions/history`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: No se pudo obtener el historial`);
  }

  return response.json();
}
