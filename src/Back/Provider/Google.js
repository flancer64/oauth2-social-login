/**
 * Implementation of the OAuth2 provider executor for Google.
 * This class implements the interface for providing Google-specific functionality.
 *
 * @implements {Fl64_OAuth2_Social_Back_Api_Provider_Connector}
 */
export default class Fl64_OAuth2_Social_Back_Provider_Google {
    /**
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Back_Config} config
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper - Database transaction wrapper
     * @param {Fl64_OAuth2_Social_Back_Helper_Web} helpWeb
     * @param {Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity} repoIdentity
     * @param {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Code} CODE
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Back_Config$: config,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_OAuth2_Social_Back_Helper_Web$: helpWeb,
            Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity$: repoIdentity,
            'Fl64_OAuth2_Social_Shared_Enum_Provider_Code.default': CODE,
        }
    ) {
        // VARS
        const A_IDENTITY = repoIdentity.getSchema().getAttributes();
        const HOST_AUTH = 'accounts.google.com';
        const HOST_TOKEN = 'oauth2.googleapis.com';
        const HOST_USER = 'www.googleapis.com';
        const URI_AUTH = '/o/oauth2/v2/auth';
        const URI_TOKEN = '/token';
        const URI_USER = '/oauth2/v3/userinfo';
        let URL_REDIRECT;

        // FUNCS
        /**
         * Initializes or retrieves the base URL for verification links.
         * This is constructed from the application configuration.
         * @return {string}
         */
        function getRedirect() {
            if (!URL_REDIRECT) {
                /** @type {TeqFw_Web_Back_Plugin_Dto_Config_Local.Dto} */
                const web = config.getLocal(DEF.SHARED.MOD_WEB.NAME);
                const base = `https://${web.urlBase}/${DEF.SHARED.SPACE}`;
                URL_REDIRECT = `${base}/${DEF.SHARED.ROUTE_CALLBACK}/${CODE.GOOGLE}`;
            }
            return URL_REDIRECT;
        }

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
                logger.info(`Trying to exchange the authorization code on Google...`);
                // Prepare the payload for exchanging the authorization code
                const payload = {
                    client_id: provider.clientId,
                    client_secret: provider.clientSecret,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: getRedirect(),
                };

                // Headers for the request
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                };

                // Perform the POST request to Google's token endpoint
                const tokenResponse = await helpWeb.post({
                    hostname: HOST_TOKEN,
                    path: URI_TOKEN,
                    payload,
                    headers,
                    timeout: 5000, // Adjust timeout as needed
                });

                // Check for required fields in the response
                if (!tokenResponse.access_token) {
                    logger.error('Failed to retrieve access token from Google response.');
                } else {
                    logger.info(`Google access token is received.`);
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
         * Retrieves the authorization URL for Google.
         *
         * @param {string} clientId
         * @param {string} state
         * @returns {string} - The authorization URL for Google
         */
        this.getAuthorizationUrl = function ({clientId, state}) {
            // TODO: add scope to incoming params
            // const scopes = encodeURIComponent('openid email profile');
            const redirect = encodeURI(getRedirect());
            return `https://${HOST_AUTH}${URI_AUTH}`
                + `?client_id=${clientId}`
                + `&scope=openid%20email%20profile`
                + `&response_type=code`
                + `&state=${state}`
                + `&redirect_uri=${redirect}`;
        };

        /**
         * Retrieves the user's data from Google.
         *
         * @param {string} accessToken - The access token received after authorization.
         * @returns {Promise<{identity:string, response:Object}>} - A promise resolving to the user's data.
         */
        this.getUserData = async function ({accessToken}) {
            try {
                // Headers for the request
                const headers = {
                    'Authorization': `Bearer ${accessToken}`,
                };

                // Perform the GET request to Google's user endpoint
                const userData = await helpWeb.get({
                    hostname: HOST_USER,
                    path: URI_USER,
                    headers,
                });

                return {identity: userData?.email?.trim().toLowerCase(), response: userData};
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to retrieve user data from Google: ${error.message}`);
            }
        };

    }

}
