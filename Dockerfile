# Usa uma imagem oficial do Node.js
FROM node:18

# Cria e define o diretório de trabalho
WORKDIR /app

# Copia os ficheiros de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos ficheiros
COPY . .

# Expõe a porta que a aplicação usa
EXPOSE 3000

# Define a variável de ambiente
ENV NODE_ENV=production

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
