FeedBoard - social network to post news or posts

## Deployment

### Create a socker image
docker build -t feedboard:1 .

### RUN the image and create a container
docker run -d -p 8400:4000 --rm --name feedback-api -v feedback:/app/feedback feedboard:1