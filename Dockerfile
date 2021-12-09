## builder
FROM nginx:alpine as builder

ARG CI_COMMIT_SHA
ENV CI_COMMIT_SHA=${CI_COMMIT_SHA}

ARG ENVIRONMENT=prod
ENV ENVIRONMENT=${ENVIRONMENT}

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN	apk update && \
	apk upgrade && \
	apk add --update --no-cache nodejs npm

# we update the path to ensure the new NodeJS version is being used
RUN export PATH=$PATH

COPY . /apps/

WORKDIR /apps

RUN cp config/app.conf /etc/nginx/conf.d/default.conf
RUN nginx -t
# "--include=dev" is needed for now as dependencies are not splitted between dev + prod
RUN npm ci --include=dev
# build files will be in /apps/build after this command
RUN npm run-script make
RUN rm build/settings.json
RUN mv build/settings_${ENVIRONMENT}.json build/settings.json
RUN sed -i -e "s/COMMIT_SHA/${CI_COMMIT_SHA}/g" build/settings.json


## prod
FROM nginx:alpine

WORKDIR /apps

RUN mkdir build

COPY --from=builder apps/build build/
COPY --from=builder apps/config/app.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

