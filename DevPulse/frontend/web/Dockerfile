# Stage 1: Base image (tools available for all stages)
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Stage 2: Install dependencies (we copy prisma schema first so postinstall generate can run)
FROM base AS deps
COPY package.json package-lock.json* ./

# if you use Prisma and have schema-based postinstall generation, copy the schema
# (keeps npm ci deterministic if you have postinstall that depends on prisma)
COPY prisma ./prisma/

RUN npm ci

# Stage 3: Build the application (uses node_modules from deps to speed up install)
FROM base AS builder
WORKDIR /app

# copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# copy project files
COPY . .

# disable Next.js telemetry in CI builds
ENV NEXT_TELEMETRY_DISABLED=1

# build the Next.js app (creates .next/standalone for Node-based standalone runtime)
RUN npm run build

# Stage 4: Production image with only what we need
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user (safer)
RUN addgroup -g 1001 nodejs || true
RUN adduser -D -u 1001 -G nodejs nextjs || true

# Copy built output and public folder from builder
# .next/standalone will contain server.js and the package.json for the standalone server
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# If you need prisma at runtime (and you use Prisma Client), copy the prisma client (client lives in node_modules)
# Make sure prisma client was generated during build and is present in node_modules in builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

USER nextjs

# Expose the port your standalone server will use (this repo used 3001 previously)
EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# The standalone build contains a server.js at root — start it with node
CMD ["node", "server.js"]
