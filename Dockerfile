FROM node:20 AS base

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

FROM base AS production

# Node js cannot be run as PID 1 in a container, 
# so we use tini to pass signals to the node process.
ENV TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Pass DATABASE_URL as a build argument
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ENV NODE_PATH=./build

RUN npm run build

CMD ["node", "build/index.js"]
