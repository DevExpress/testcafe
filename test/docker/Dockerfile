ARG tag
FROM testcafe/testcafe:$tag

USER root
COPY . /usr/lib/node_modules/testcafe
RUN cd /usr/lib/node_modules/testcafe && npm install --only=dev && \
    node node_modules/gulp/bin/gulp.js --steps-as-tasks --gulpfile Gulpfile.js test-server-run
USER user
