# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t pmcosmetics-api .
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/api/prisma apps/api/prisma
COPY apps/web/package.json apps/web/
COPY apps/mobile/package.json apps/mobile/
RUN npm ci
COPY apps/api apps/api
RUN npm run build -w @pmcosmetics/api

FROM node:20-alpine
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo /repo
EXPOSE 3001
CMD ["npm", "run", "start", "-w", "@pmcosmetics/api"]
