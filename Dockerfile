FROM node:16.14

RUN apt-get update && apt-get install -y \
    apache2

# set servername
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# run apache2
EXPOSE 80
CMD ["apachectl", "-D",  "FOREGROUND"]

RUN mkdir /home/tno-eats

WORKDIR /home/tno-eats

RUN npm install -g truffle ganache --silent

WORKDIR /home/tno-eats/client
COPY package*.json ./
RUN npm install
COPY ./client/ .
RUN npm run build
RUN cp -a ./dist/. /var/www/html/

WORKDIR /home/tno-eats
