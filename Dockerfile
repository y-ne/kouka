FROM oven/bun:1-alpine AS build

WORKDIR /app

COPY package.json ./
COPY bun.lock* ./

RUN bun install

COPY ./src ./src

ENV NODE_ENV=production

RUN bun build \
	--target bun \
	--minify-whitespace \
	--minify-syntax \
	--outfile dist/index.js \
	src/index.ts

FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY bun.lock* ./

RUN bun install --production

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "dist/index.js"]
