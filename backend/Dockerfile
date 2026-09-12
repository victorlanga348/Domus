FROM node:20-alpine

# Instalação do openssl (necessário para o Prisma Engine no Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Otimização de cache de camadas do Docker
COPY package*.json ./
COPY src/database/schema.prisma ./src/database/schema.prisma

# Instala dependências e gera o Prisma Client no ambiente Alpine
RUN npm install
RUN npx prisma generate --schema=./src/database/schema.prisma

# Copia o restante do código-fonte
COPY . .

# Permissão de execução para o entrypoint
RUN chmod +x ./docker-entrypoint.sh

# Portas suportadas (padrão DOMUS: 3333 / alternativa: 5000)
EXPOSE 3333
EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
