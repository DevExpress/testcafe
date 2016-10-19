# Contributing to TestCafe

TestCafe would not be possible without active support from the community. We certainly appreciate and would
encourage your contributions, no matter how large or small.

To that end, please review our contribution guidelines first.

* [Code of Conduct](#code-of-conduct)
* [General Discussion](#general-discussion)
* [Reporting a Problem](#reporting-a-problem)
* [Code Contribution](#code-contribution)

## Code of Conduct

TestCafe has adopted a [Contributor Code of Conduct](CODE_OF_CONDUCT.md), abide by its terms.

## General Discussion

If you have a question about TestCafe or want to share your opinion,
please visit our [discussion board](https://testcafe-discuss.devexpress.com/).

## Reporting a Problem

If you find a problem when using TestCafe, please file an issue in our [GitHub repository](https://github.com/DevExpress/testcafe/issues).
However, to save some time, please search through the existing issues to see if the problem has already been reported or addressed.

When you create a new issue, template text is automatically added to its body.
To help us understand the issue you're describing, be sure to fill in all sections in this template.

## Code Contribution

Please follow the steps below when submitting your code.

1. Search the [list of issues](https://github.com/DevExpress/testcafe/issues) to see if there
  is an issue for the bug or feature you are going to work on. If you do not find one, please create your own.

2. If you are going to address an existing issue, check the comment thread to make sure that nobody is working on it at the moment.

3. Leave a comment saying that you are willing to fix this issue, and if possible, provide details on how you are going to do this.

4. Core team members may need to discuss the details of the proposed fix with you. As soon as you get the green light from them,
  leave a comment saying that you are currently working on this issue.

5. Fork TestCafe and create a branch in your fork. Name this branch with an issue number, e.g. `gh852`, `gh853`.
  
    > If you are going to update the documentation, do this in a separate branch, e.g. `gh852-docs`.

6. Commit your changes into the branch.

7. Add regression tests to the appropriate sections if you are fixing a bug. You can find these sections by searching for `Regression` in the code.

    Add unit and/or functional tests if you are developing a new functionality.

8. Fetch upstream changes and rebase your branch onto `master`.

9. Run tests before submitting a pull request to ensure that everything works properly.

    ```sh
    gulp test-server
    gulp test-functional-local
    gulp test-client
    ```

10. Push changes to your fork.

11. Submit a pull request. If you are also updating the documentation, submit a separate pull request for these changes.

    The pull request name should describe what has been done and contain
    the [closes](https://github.com/blog/1506-closing-issues-via-pull-requests) directive
    with an appropriate issue number.

    Documentation pull requests should have the `[docs]` prefix in their title.
    This ensures that documentation tests are triggered against these pull requests.