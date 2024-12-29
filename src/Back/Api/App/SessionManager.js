/**
 * Interface for session management in the application.
 *
 * This is a documentation-only interface (not executable).
 *
 * @interface
 */
export default class Fl64_OAuth2_Social_Back_Api_App_SessionManager {
    /**
     * Establishes a new session for the user.
     * @param {Object} params
     * @param {number} params.userId - The unique identifier of the user.
     * @param {Object} [params.data] - Additional session data (e.g., tokens, roles, preferences).
     * @param {number} [params.lifetime] - The lifetime of the session in seconds. Defaults to the configured session lifetime if not provided.
     * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} params.httpRequest - The HTTP request object associated with the user's action.
     * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} params.httpResponse - The HTTP response object for setting cookies or headers related to the session.
     * @param {TeqFw_Db_Back_RDb_ITrans} params.trx - The database transaction context to ensure atomic operations.
     * @returns {Promise<{sessionId: number}>} - An object containing the unique identifier of the newly created session (`sessionId`).
     */
    async establishSession({userId, data, lifetime, httpRequest, httpResponse, trx}) {}
}
