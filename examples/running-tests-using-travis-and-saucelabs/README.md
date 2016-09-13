# Example: Running Tests Using Travis CI and Sauce Labs

A set of sample files that help you to learn how to run TestCafe tests in the cloud using Travis CI and Sauce Labs (see [Running Tests Using Travis CI and Sauce Labs](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html)).

The following files are included:

* *server.js* - runs an HTTP server for the application.
* *index.html* - the application's main page.
* *package.json* - the project description file. The package.json file's `dependencies` list already contains all needed packages to run the application, the `devDependencies` list contains TestCafe and Sauce Labs browser provider. The file also includes the `test` script that starts the application and runs TestCafe tests on a Sauce Labs browser.
* *tests/index-test.js* - a simple TestCafe test.
* *.travis.yml* - a Travis CI configuration file.

## Running the example

1. Create a GitHub repository and copy the sample files to it.
2. Go through [Step 2](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html/#step-2---enable-travis-for-your-project) and [Step 3](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html/#step-3---configure-travis-to-use-sauce-labs) described in the [Running Tests Using Travis CI and Sauce Labs](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html/) topic.

     There is no need to complete [Step 1](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html#step-1---install-testcafe-and-create-tests), [Step 4](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html/#step-4---install-the-sauce-labs-browser-provider-plugin) and [Step 5](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html/#step-5---add-the-test-script-to-packagejson) because the sample files already have the corresponding settings.

3. Trigger a Travis CI build ([Step 6](http://devexpress.github.io/testcafe/documentation/recipes/running-tests-using-travis-ci-and-sauce-labs.html/#step-6---trigger-a-travis-ci-build)), for example, by modifying the *index.html* file and pushing it into your repository. Then check the [build status page](https://travis-ci.org/repositories).