FROM node:12

WORKDIR /app

COPY package.json .

RUN npm install

EXPOSE 4000

CMD [ "npm", "start" ]