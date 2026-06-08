"use client";
import { useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Si usas Clerk para el ID

export default function ActivarCuenta() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', dni: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/users/sync-cbu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user?.id, // ID del usuario logueado
          ...formData
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`¡CBU Activado! Tu número es: ${data.cbu}`);
        window.location.reload(); // Recargamos para ver los cambios
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al sincronizar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Activar CBU Interbancario</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Nombre" required
          className="w-full p-2 border rounded"
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
        />
        <input 
          type="text" placeholder="Apellido" required
          className="w-full p-2 border rounded"
          onChange={(e) => setFormData({...formData, apellido: e.target.value})}
        />
        <input 
          type="text" placeholder="DNI" required
          className="w-full p-2 border rounded"
          onChange={(e) => setFormData({...formData, dni: e.target.value})}
        />
        <button 
          type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Sincronizando...' : 'Obtener mi CBU'}
        </button>
      </form>
    </div>
  );
}