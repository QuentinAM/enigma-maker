FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g ts-node
EXPOSE 3000
CMD ["npm", "run", "start"]