# FeedBoard - social network to post news or posts

## Deployment
We will be run all applications on docker.

### First, we need to have a network and bring all applications on that network
`docker network create feedboard-net`

### Install and run mongodb instance as a container
To Make sure, we don't lose data if a container restarts or re-creates. So, volume is important.

`docker run -d -p 27017:27017 --name feedboard-mongodb -v data:/data/db --network feedboard-net --rm mongo`

### Working on the server app
`cd server`

#### Build an image
`docker build -t feedboard-server:1 .`

#### Run the app
`docker run -d -p 4000:4000 --env-file docker.env --name feedback-server-app --network feedboard-net --rm  feedboard-server:1`


### Working on the client app
`cd client`

#### Build an image

`docker build -t feedboard-client:1 . `

#### Run the app
Since React app runs on a browser. So, it doesn't matter if that container in the same network. Also the rest api domain shouldn't point to a container name. We can leave as localhost.If needs then just apply changes in .env file
-it(interactive mode) is important otherwise React app stops

`docker run --name feedback-client-app -d -p 3000:3000 -it --rm feedboard-client:1`

### Deploy in prod
#### UI app
Use Dockerfile.prod to make an image

`cd client`

`docker build -t feedboard-ui-prod -f Dockerfile.prod .`

Run the build to validate
`docker run --name feedboard-ui-app -d -p 3000:80 -it --rm feedboard-ui-prod`

#### Api app
`cd server`

`docker build -t feedboard-backend-prod .`

`docker run -d -p 4000:80 --env-file docker.prod.env --name feedback-backend-app --rm feedboard-backend-prod`

Push both images to docker hub.

## Docker Compose
### Run applications through docker-compose: Elegant Multi-Container Orchestration
To create and run services. Docker compose creates a default network for these service. So, doesn't need by default
--build - it creates an image again otherwise it uses an existing

`docker-compose up -d --build`

To stop and remove created services. By default it doesnt remove volume. -v helps to remove
`docker-compose down -v`

