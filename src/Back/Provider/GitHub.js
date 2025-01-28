/**
 * Implementation of the OAuth2 provider executor for GitHub.
 * This class implements the interface for providing GitHub-specific functionality.
 *
 * @implements {Fl64_OAuth2_Social_Back_Api_Plugin_Provider_Executor}
 */
export default class Fl64_OAuth2_Social_Back_Provider_GitHub {
    /**
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {Fl64_OAuth2_Social_Back_Helper_Web} helpWeb
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            Fl64_OAuth2_Social_Back_Helper_Web$: helpWeb,
        }
    ) {
        // VARS
        const HOST = 'github.com';
        const HOST_API = 'api.github.com';
        const URI_API_USER = '/user';
        const URI_API_USER_EMAILS = '/user/emails';
        const URI_AUTH = '/login/oauth/authorize';
        const URI_TOKEN = '/login/oauth/access_token';

        // FUNCS

        // MAIN
        this.exchangeAuthorizationCode = async function ({trx, provider, code}) {
            try {
                logger.info(`Trying to exchange the authorization code on GitHub...`);
                // Prepare the payload for exchanging the authorization code
                const payload = {
                    client_id: provider.clientId,
                    client_secret: provider.clientSecret,
                    code: code,
                };

                // Headers for the request
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // GitHub requires this to return JSON instead of URL-encoded data
                };

                // Perform the POST request to GitHub's token endpoint
                const tokenResponse = await helpWeb.post({
                    hostname: HOST,
                    path: URI_TOKEN,
                    payload,
                    headers,
                    timeout: 5000, // Adjust timeout as needed
                });

                // Check for required fields in the response
                if (!tokenResponse.access_token) {
                    logger.error('Failed to retrieve access token from GitHub response.');
                } else {
                    logger.info(`GitHub access token is received.`);
                    // Return the access token and additional response data
                    return {
                        accessToken: tokenResponse.access_token,
                        scope: tokenResponse.scope,
                        tokenType: tokenResponse.token_type,
                    };
                }
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to exchange authorization code: ${error.message}`);
            }
        };

        /**
         * Retrieves the authorization URL for GitHub.
         *
         * @param {string} clientId
         * @param {string} state
         * @returns {string} - The authorization URL for GitHub
         */
        this.getAuthorizationUrl = function ({clientId, state}) {
            return `https://${HOST}${URI_AUTH}?client_id=${clientId}&scope=user:email&state=${state}`;
        };

        /**
         * Retrieves the user's data from GitHub.
         *
         * @param {string} accessToken - The access token received after authorization.
         * @returns {Promise<{email:string, response:Object}>} - A promise resolving to the user's data.
         */
        this.getUserData = async function ({accessToken}) {
            try {
                // Headers for the request
                const headers = {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json', // Ensure GitHub API version compatibility
                    'User-Agent': DEF.NAME, // Required by GitHub API
                };

                // Perform the GET request to GitHub's user endpoint
                const userData = await helpWeb.get({
                    hostname: HOST_API,
                    path: URI_API_USER,
                    headers,
                });

                // Check if the email is missing and retrieve it from the additional endpoint
                if (!userData.email) {
                    const emailsData = await helpWeb.get({
                        hostname: HOST_API,
                        path: URI_API_USER_EMAILS,
                        headers,
                    });

                    // Assign the primary email or the first available one
                    userData.email = emailsData.find(emailObj => emailObj.primary)?.email || emailsData[0]?.email;
                }

                return {email: userData.email, response: userData};
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to retrieve user data from GitHub: ${error.message}`);
            }
        };

    }

}
