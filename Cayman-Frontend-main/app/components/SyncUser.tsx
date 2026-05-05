'use client';

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { API_URL } from "@/lib/api";

export default function SyncUser() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const syncWithBackend = async () => {
      // Solo ejecutamos si el usuario terminó de cargar y está logueado
      if (isLoaded && isSignedIn && user) {
        try {
          const response = await fetch(`${API_URL}/users/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              fullName: user.fullName,
            }),
          });

          if (response.ok) {
            console.log("✅ Sincronización exitosa con el backend");
          } else {
            console.warn("⚠️ El usuario ya estaba sincronizado o hubo un problema menor.");
          }
        } catch (error) {
          console.error("❌ Error de conexión con el servidor NestJS:", error);
        }
      }
    };

    syncWithBackend();
  }, [isLoaded, isSignedIn, user]);

  return null; // Este componente es un "worker" invisible
}
