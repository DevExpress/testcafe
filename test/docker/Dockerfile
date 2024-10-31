ARG tag
FROM testcafe/testcafe:$tag

USER root
WORKDIR /usr/local/lib/node_modules/testcafe
COPY ./ ./
RUN npm install
RUN npx gulp --gulpfile Gulpfile.js build
RUN npx gulp --steps-as-tasks --gulpfile Gulpfile.js test-server-run
