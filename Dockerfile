FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install --prefix ./server
RUN npm install --prefix ./client
RUN npm run build --prefix ./client
EXPOSE 3000
CMD ["node", "server/index.mjs"]