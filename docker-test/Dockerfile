ARG tag
FROM testcafe/testcafe:$tag

USER root
RUN cd /opt/testcafe && ls
COPY . /usr/lib/node_modules/testcafe
RUN cd /usr/lib/node_modules/testcafe && npm install --only=dev && node node_modules/gulp/bin/gulp.js --gulpfile Gulpfile.js test-server-docker
USER user
