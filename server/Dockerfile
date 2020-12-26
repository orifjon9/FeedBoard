FROM node

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4000

# the app runs in the app folder
# the app can save any data in the data folder
# anonymous volume will be removing when a container removes
# named valume is not because it doesn't attach to a container
VOLUME [ "/app/data" ]

CMD [ "node", "app.js" ]