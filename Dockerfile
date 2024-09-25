# Utilizez iso Linux Alpina cu versiunea node 14
FROM node:19.5.0-alpine

# Indicam directoria (toata aplicatia va fi aici)
WORKDIR /app

# Copiem package.json si package-lock.json in interiorul containerului. Il copiem in app
COPY package*.json ./

# Instalam dependentele
RUN npm install

# Copiem restul aplicatiei in container
COPY . .

# Instalam Prisma
RUN npm install -g prisma

# Generam Prisma client
RUN prisma generate

# Copiem prisma schema (in interiorul containerului)
COPY prisma/schema.prisma ./prisma/

# Deschidem portul in container
EXPOSE 4444

# Pornim serverul
CMD ["npm", "run", "start:"]
