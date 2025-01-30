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
        const AUTH_HOST = 'accounts.google.com';
        const AUTH_URI = '/o/oauth2/v2/auth';
        const A_IDENTITY = repoIdentity.getSchema().getAttributes();
        const TOKEN_HOST = 'oauth2.googleapis.com';
        const TOKEN_URI = '/token';
        const USER_HOST = 'www.googleapis.com';
        const USER_URI = '/oauth2/v3/userinfo';
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
            let accessToken = null, response = null;
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
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                };
                response = await helpWeb.post({
                    hostname: TOKEN_HOST,
                    path: TOKEN_URI,
                    payload,
                    headers,
                });
                if (!response?.access_token) {
                    logger.error('Failed to retrieve access token from Google response.');
                } else {
                    logger.info(`Google access token is received.`);
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
                + `&scope=openid%20email%20profile`
                + `&response_type=code`
                + `&state=${state}`
                + `&redirect_uri=${getRedirect()}`;
        };

        this.getUserData = async function ({accessToken}) {
            let identity = null, response = null;
            try {
                const headers = {
                    'Authorization': `Bearer ${accessToken}`,
                };
                response = await helpWeb.get({
                    hostname: USER_HOST,
                    path: USER_URI,
                    headers,
                });
                if (response?.email) {
                    identity = response.email.trim().toLowerCase();
                    logger.info(`Data for user '${identity}' is retrieved.`);
                }
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to retrieve user data from Google: ${error.message}`);
            }
            return {identity, response};
        };

    }

}
