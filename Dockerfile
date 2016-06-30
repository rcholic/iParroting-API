#FROM rcholic/sails-microservice:dev
FROM node:latest
RUN npm install sails mongodb forever -g
RUN  mkdir -p /host && cd /host && ls -la
WORKDIR /host
#ADD package.json package.json
RUN npm install
EXPOSE 1337
#CMD sails lift
CMD PORT=1337 forever start app.js
