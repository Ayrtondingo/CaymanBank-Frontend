# Frontend de Cayman Bank (Next.js, salida standalone).
#
# Las variables NEXT_PUBLIC_* se incrustan en el JavaScript al compilar, por
# eso entran como build args y no alcanza con pasarlas al contenedor.

FROM node:22-alpine AS build
WORKDIR /app
# El droplet tiene 512 MB de RAM: Node fija su limite de memoria segun la RAM
# fisica y el compilador se queda corto. Con esto puede usar el swap.
ENV NODE_OPTIONS=--max-old-space-size=1536
COPY package.json package-lock.json ./
RUN npm ci

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/inicio
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/inicio
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
# `npm run build` corre antes scripts/check-env.mjs, que exige CLERK_SECRET_KEY.
# Esa key es secreta y solo hace falta en tiempo de ejecucion (middleware), asi
# que no se mete en la imagen: se compila directo con next build.
RUN test -n "$NEXT_PUBLIC_API_URL" && test -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
  || (echo "Faltan NEXT_PUBLIC_API_URL o NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" && exit 1)
RUN npx next build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
