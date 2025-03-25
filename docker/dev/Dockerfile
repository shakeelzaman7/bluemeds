FROM node:16.16.0-alpine

RUN mkdir /app
WORKDIR /app

RUN npm cache clean --force

RUN npm install --location=global @angular/cli

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 4200 49153
CMD npm run start
