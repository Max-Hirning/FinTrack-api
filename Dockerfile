FROM node:20 AS base

WORKDIR /home/node/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

# Use tini to handle signals
ENV TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Set the command to run your application
CMD ["node", "build/index.js"]

# Expose the port your app runs on
EXPOSE 3001
