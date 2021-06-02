FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
ARG CI_COMMIT_SHA
ENV CI_COMMIT_SHA "${CI_COMMIT_SHA}"
RUN apt-get update && apt-get install -yq nodejs npm curl rsync ssh nginx
RUN npm install -g n
RUN n 15
# we purge the old NodeJS version
RUN apt-get purge -yq nodejs npm
# we update the path to ensure the new NodeJS version is being used
RUN export PATH=$PATH
COPY . /apps/
WORKDIR /apps
RUN cp config/app.conf /etc/nginx/sites-enabled/app.conf
RUN rm /etc/nginx/sites-enabled/default
RUN nginx -t 
RUN npm ci
# build files will be in /apps/build/web after this command
RUN npm run-script make
RUN rm /apps/build/web/settings.json
RUN mv /apps/build/web/settings_prod.json /apps/build/web/settings.json
RUN sed -i -e "s/COMMIT_SHA/${CI_COMMIT_SHA}/g" build/web/settings.json
CMD ["nginx", "-g", "daemon off;"]
