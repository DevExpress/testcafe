
// {{#allowReferences}}
/// <reference path="test-controller.d.ts" />
// {{/allowReferences}}

interface Role {

}

interface RoleOptions {
    /**
     * Use this option to control which page is opened after you switch to the role.
     *
     * By default, TestCafe navigates back to the page that was opened previously to switching to the role.
     * Set the `preserveUrl` option to true to save the URL to which the browser was redirected after logging in.
     * TestCafe will navigate to the saved URL each time after you switch to this role.
     *
     * This option is useful if you store session-related data (like session ID) in the URL.
     */
    preserveUrl?: boolean;
}

interface RoleFactory {
    (url: String, fn: (t: TestController) => Promise<any>, options?: RoleOptions): Role;
    /**
     * Creates an anonymous user role.
     */
    anonymous(): Role;
}
