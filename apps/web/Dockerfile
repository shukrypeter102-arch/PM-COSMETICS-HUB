# Build from the repository root:
#   docker build -f apps/web/Dockerfile -t pmcosmetics-web .
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma
COPY apps/mobile/package.json apps/mobile/
RUN npm ci
COPY apps/web apps/web
RUN npm run build -w @pmcosmetics/web

FROM node:20-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo /repo
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@pmcosmetics/web"]
