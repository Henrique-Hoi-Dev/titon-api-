FROM node:20-alpine

RUN mkdir -p /usr/app/current

WORKDIR /usr/app/current

COPY package.json package-lock.json ./

RUN npm i -g cross-env nodemon jest@^27.5.1 pino-pretty --silent
RUN npm ci --silent

COPY . .

EXPOSE 8080

ENV NODE_ENV production
ENV TZ="America/Sao_Paulo"

CMD [ "nodemon", "server.js" ]
