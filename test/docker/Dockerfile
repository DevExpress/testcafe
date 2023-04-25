ARG tag
FROM testcafe/testcafe:$tag

USER root
WORKDIR /usr/local/lib/node_modules/testcafe
COPY ./ ./
# NOTE: testcafe-browser-provider-browserstack -> sharp module failed to install on the Alpine Linux 18.x
# https://github.com/lovell/sharp/issues/3641
RUN node -e 'const fs = require("fs"); const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8")); delete pkg.devDependencies["testcafe-browser-provider-browserstack"]; fs.writeFileSync("./package.json", JSON.stringify(pkg), "utf-8");'
RUN npm install
RUN npx gulp --steps-as-tasks --gulpfile Gulpfile.js test-server-run
