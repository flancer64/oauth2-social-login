/**
 * Implementation of the OAuth2 provider executor for GitHub.
 * This class implements the interface for providing GitHub-specific functionality.
 *
 * @implements {Fl64_OAuth2_Social_Back_Api_Provider_Connector}
 */
export default class Fl64_OAuth2_Social_Back_Provider_GitHub {
    /**
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper - Database transaction wrapper
     * @param {Fl64_OAuth2_Social_Back_Helper_Web} helpWeb
     * @param {Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity} repoIdentity
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_OAuth2_Social_Back_Helper_Web$: helpWeb,
            Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity$: repoIdentity,
        }
    ) {
        // VARS
        const A_IDENTITY = repoIdentity.getSchema().getAttributes();
        const HOST = 'github.com';
        const HOST_API = 'api.github.com';
        const URI_API_USER = '/user';
        const URI_AUTH = '/login/oauth/authorize';
        const URI_TOKEN = '/login/oauth/access_token';

        // FUNCS

        // MAIN
        this.checkIdentity = async function ({trx: trxOuter, provider, identity, userData}) {
            let userId = null;
            await trxWrapper.execute(trxOuter, async (trx) => {
                const key = {[A_IDENTITY.PROVIDER_REF]: provider.id, [A_IDENTITY.UID]: identity};
                const {record} = await repoIdentity.readOne({trx, key});
                if (record) userId = record[A_IDENTITY.USER_REF];
            });
            return {userId};
        };

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
         * @returns {Promise<{identity:string, response:Object}>} - A promise resolving to the user's data.
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

                return {identity: userData.login, response: userData};
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to retrieve user data from GitHub: ${error.message}`);
            }
        };

    }

}
