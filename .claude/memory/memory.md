# Memory — meu-projeto (Iter Vigilans)

## Stack & Arquitetura
- Next.js 16.2.6 (App Router), React 19.2.4, TypeScript, Tailwind CSS v4
- MySQL (mysql2/promise), pool em `lib/db.ts`
- MapLibre GL JS + react-map-gl v8 (maplibre export) — substituiu Leaflet/react-leaflet
- lucide-react para ícones (substituiu emojis em todo o projeto)
- Server Actions em `app/*/actions.ts`, API routes em `app/api/*/route.ts`
- Tema: bg-black, cards bg-zinc-900, destaque emerald-500, fonte serif nos títulos, sidebar fixa w-64

## Decisões
- 2026-06-18: Migrado de Leaflet para MapLibre GL JS — melhor performance WebGL, tiles vetoriais, sem API key
- 2026-06-18: Mapa usa CARTO Dark Matter style (gratuito, sem API key): `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
- 2026-06-18: Círculos geográficos no mapa gerados como GeoJSON Polygon (64 lados) em vez de Leaflet Circle
- 2026-06-18: `criarOcorrencia` agora geocodifica endereço via Nominatim API após inserir no DB, para lat/lon aparecer no mapa
- 2026-06-18: Postos seguros persistidos no banco (`postos_seguros` table) com TTL de 24h; sincroniza da Overpass API automaticamente
- 2026-06-18: `/mapa/page.tsx` é server component com `dynamic = 'force-dynamic'`; dados vêm do banco via `buscarOcorrenciasComCoordenadas()`
- 2026-06-18: `deletarOcorrencia` e `criarOcorrencia` chamam `revalidatePath('/mapa')` além de `/alertas` e `/dashboard`

## Bugs & Erros conhecidos
- Alertas sem lat/lon não aparecem no mapa — resolvido: geocoding automático em `criarOcorrencia` via Nominatim
- Mapa usava array estático `HISTORICO_CRIMINAL_CURITIBA` — resolvido: agora lê do banco
- Postos seguros eram buscados via Overpass a cada carregamento — resolvido: cache no banco com TTL 24h
- MySQL2 retorna DECIMAL como string JavaScript — resolvido: `parseFloat()` aplicado em `buscarOcorrenciasComCoordenadas`, `buscarOcorrenciasDoMapa` e `buscarPostosDB`; sem isso MapLibre recebia strings e falhava silenciosamente
- `distanciaMinima` ficava em "Calculando..." para sempre sem GPS — resolvido: inicializado via lazy `useState(() => ...)` calculando do `postosIniciais` com coordenadas padrão de Curitiba

## Padrões & Convenções
- Componentes de mapa são 'use client' e importados via `dynamic(() => ..., { ssr: false })` para evitar SSR
- Sidebar repetida em cada página (não extraída para componente compartilhado)
- Ícones: Home, AlertTriangle, MapPin, LogOut, Lightbulb, TriangleAlert, Building2, Trash2, ThumbsUp, CheckCircle2, Megaphone, X, Users, Zap
- API route `/api/postos-seguros?lat=X&lon=Y&raio=Z` retorna `{ postos: PostoSeguro[] }`

## Histórico de sessões
- 2026-06-18: Implementadas 4 prioridades: (1) bug mapa corrigido — mapa lê do banco, (2) emojis trocados por lucide-react, (3) banco de dados para postos seguros, (4) migração Leaflet → MapLibre GL JS. Build passou sem erros.
