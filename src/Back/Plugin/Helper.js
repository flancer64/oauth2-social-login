/**
 * The main helper for this plugin.
 */
export default class Fl64_OAuth2_Social_Back_Plugin_Helper {
    constructor() {
        // VARS

        // FUNCS

        // MAIN

        /**
         * Determines the URL to redirect the user after a successful session creation.
         *
         * @param {Object} params
         * @param {number} params.sessionId - The unique identifier of the user's session.
         * @param {TeqFw_Db_Back_RDb_ITrans} params.trx - The database transaction context, if needed for additional queries.
         * @param {string} params.provider - The OAuth2 provider code used for authentication.
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} params.httpRequest - The HTTP request object.
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} params.httpResponse - The HTTP response object.
         * @returns {Promise<string>} - The URL to redirect the user.
         */
        this.getUrlSessionSucceed = async function ({sessionId, trx, provider, httpRequest, httpResponse}) {
            // Default implementation returns the root URL
            // TODO: define default page for succeed authentication, not the homepage.
            return '/';
        };
    }
}
