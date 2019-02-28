FROM alpine:edge
ARG packageId

COPY ${packageId} /opt/testcafe/${packageId}
COPY docker/testcafe-docker.sh /opt/testcafe/docker/testcafe-docker.sh

RUN apk --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ upgrade && \
 apk --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/testing/ add \
 nodejs nodejs-npm chromium firefox xwininfo xvfb dbus eudev ttf-freefont fluxbox procps

RUN npm install -g /opt/testcafe/${packageId} && \
 npm cache clean --force && \
 rm -rf /tmp/* && \
 chmod +x /opt/testcafe/docker/testcafe-docker.sh && \
 adduser -D user && \
 rm /opt/testcafe/${packageId}


USER user
EXPOSE 1337 1338
ENTRYPOINT ["/opt/testcafe/docker/testcafe-docker.sh"]


