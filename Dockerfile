FROM node

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
RUN yarn install
COPY . .

EXPOSE 8080
ENTRYPOINT yarn start
