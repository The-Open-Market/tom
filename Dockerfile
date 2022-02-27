FROM node:16.14

RUN mkdir /home/tno-eats

WORKDIR /home/tno-eats

RUN npm install -g truffle --silent
