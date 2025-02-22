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
        const AUTH_HOST = 'github.com';
        const AUTH_URI = '/login/oauth/authorize';
        const A_IDENTITY = repoIdentity.getSchema().getAttributes();
        const TOKEN_HOST = 'github.com';
        const TOKEN_URI = '/login/oauth/access_token';
        const USER_HOST = 'api.github.com';
        const USER_URI = '/user';

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
            let accessToken = null, response = null;
            try {
                logger.info(`Trying to exchange the authorization code on GitHub...`);
                // Prepare the payload for exchanging the authorization code
                const payload = {
                    client_id: provider.clientId,
                    client_secret: provider.clientSecret,
                    code: code,
                };
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // GitHub requires this to return JSON instead of URL-encoded data
                };
                response = await helpWeb.post({
                    hostname: TOKEN_HOST,
                    path: TOKEN_URI,
                    payload,
                    headers,
                });
                if (!response?.access_token) {
                    logger.error(`Failed to retrieve access token from GitHub response: ${JSON.stringify(response)}`);
                } else {
                    logger.info(`GitHub access token is received.`);
                    accessToken = response.access_token;
                }
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to exchange authorization code: ${error.message}`);
            }
            return {accessToken, response};
        };


        this.getAuthorizationUrl = function ({clientId, state}) {
            return `https://${AUTH_HOST}${AUTH_URI}`
                + `?client_id=${clientId}`
                + `&scope=user:email`
                + `&state=${state}`;
        };


        this.getUserData = async function ({accessToken}) {
            let identity = null, response = null;
            try {
                const headers = {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/vnd.github.v3+json', // Ensure GitHub API version compatibility
                    'User-Agent': DEF.NAME, // Required by GitHub API
                };
                response = await helpWeb.get({
                    hostname: USER_HOST,
                    path: USER_URI,
                    headers,
                });
                if (response?.login) {
                    identity = response.login;
                    logger.info(`Data for user '${identity}' is retrieved.`);
                }
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to retrieve user data from GitHub: ${error.message}`);
            }
            return {identity, response};
        };

    }

}
