FROM node:18.12.0-alpine as build-step

RUN apk --no-cache add build-base
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 \
    && ln -sf python3 /usr/bin/python \
    && python3 -m ensurepip \
    && pip3 install --no-cache --upgrade pip setuptools

RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install --legacy-peer-deps
COPY . /app
RUN npm run build_prod

FROM nginx:1.22
RUN apt-get update && apt-get install -y supervisor

# Para ver los errores en el log del docker
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
# Configuraciones del cache para poder usarlo
    && mkdir -p /var/cache/ngx_pagespeed && \
    chmod -R o+wr /var/cache/ngx_pagespeed

# Copio certificados, conf y app
COPY --from=build-step /app/docker/nginx.conf /etc/nginx/conf.d/
COPY --from=build-step /app/docker/supervisor.conf /etc/supervisor/conf.d/
COPY --from=build-step /app/docker/certs /etc/nginx/certs
COPY --from=build-step /app/www /usr/share/nginx/html

CMD ["/usr/bin/supervisord"]
