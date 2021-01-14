FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ENV PORT=80
ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=secres
ENV MONGODB_URL=localhost:27017

EXPOSE $PORT

CMD [ "npm", "run", "start:prod" ]