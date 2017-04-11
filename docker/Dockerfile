FROM alpine:latest

RUN apk --no-cache add nodejs chromium firefox-esr xvfb dbus eudev ttf-freefont fluxbox

COPY . /opt/testcafe

RUN cd /opt/testcafe; \
 npm install --production && \
 npm cache clean && \
 rm -rf /tmp/* && \
 chmod +x /opt/testcafe/docker/testcafe-docker.sh && \
 adduser -D user

USER user
EXPOSE 1337 1338
ENTRYPOINT ["/opt/testcafe/docker/testcafe-docker.sh"]


