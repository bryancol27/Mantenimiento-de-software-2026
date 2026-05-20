FROM node:20-slim

# Directorio de trabajo
WORKDIR /app

# Copiar manifiestos
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev

# Copiar el resto de archivos
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]
