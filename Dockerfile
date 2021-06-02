FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -yq nodejs npm curl rsync ssh
RUN npm install -g n
RUN n 15
# we purge the old NodeJS version
RUN apt-get purge -yq nodejs npm
# we update the path to ensure the new NodeJS version is being used
RUN export PATH=$PATH
COPY . /apps/
WORKDIR /apps
RUN npm ci
# build files will be in /apps/build/web after this command
RUN npm run-script make