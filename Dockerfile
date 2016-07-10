#FROM rcholic/sails-microservice:dev
FROM node:latest
RUN npm install -g sails mongodb forever pm2
RUN  mkdir -p /host && cd /host && ls -la
WORKDIR /host
#ADD package.json package.json
RUN npm install
EXPOSE 1337
#CMD sails lift
CMD PORT=1337 forever app.js --minUptime 6000 --prod
#CMD ["node_modules/forever/bin/forever", "start", "app.js", "--prod"]
#CMD pm2 start app.js -x -- --prod
