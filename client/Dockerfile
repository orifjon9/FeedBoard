FROM node:12

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ARG ARG_PORT
ARG ARG_API_URL

ENV API_URL=$ARG_API_URL

EXPOSE $ARG_PORT

CMD [ "npm", "run", "start" ]