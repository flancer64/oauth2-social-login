import {randomUUID} from 'node:crypto';

/**
 * Implementation of the OAuth2 provider executor for X (Twitter).
 * This class implements the interface for providing X-specific functionality.
 *
 * https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/user-access-token
 *
 * @implements {Fl64_OAuth2_Social_Back_Api_Provider_Connector}
 */
export default class Fl64_OAuth2_Social_Back_Provider_X {
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
        const AUTH_HOST = 'x.com';
        const AUTH_URI = '/i/oauth2/authorize';
        const A_IDENTITY = repoIdentity.getSchema().getAttributes();
        const CHALLENGE = randomUUID(); // this value is changed on every run
        const TOKEN_HOST = 'api.x.com';
        const TOKEN_URI = '/2/oauth2/token';
        const USER_HOST = 'api.x.com';
        const USER_URI = '/2/users/me';
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
                URL_REDIRECT = `${base}/${DEF.SHARED.ROUTE_CALLBACK}/${CODE.X}`;
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
                logger.info(`Trying to exchange the authorization code on X...`);
                // Prepare the payload for exchanging the authorization code
                const payload = new URLSearchParams({
                    code: code,
                    grant_type: 'authorization_code',
                    client_id: provider.clientId,
                    redirect_uri: getRedirect(),
                    code_verifier: CHALLENGE,
                });
                const basicAuth = Buffer.from(`${provider.clientId}:${provider.clientSecret}`)
                    .toString('base64');
                const headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`,
                };
                response = await helpWeb.post({
                    hostname: TOKEN_HOST,
                    path: TOKEN_URI,
                    payload: payload.toString(),
                    headers,
                });
                if (!response?.access_token) {
                    logger.error('Failed to retrieve access token from X response.');
                } else {
                    logger.info(`X access token is received.`);
                    accessToken = response.access_token;
                }
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to exchange authorization code: ${error.message}`);
            }
            return {accessToken, response};
        };

        this.getAuthorizationUrl = function ({clientId, state}) {
            const redirect = encodeURI(getRedirect());
            return `https://${AUTH_HOST}${AUTH_URI}`
                + `?response_type=code`
                + `&client_id=${clientId}`
                + `&redirect_uri=${redirect}`
                + `&scope=users.read%20tweet.read`
                + `&state=${state}`
                + `&code_challenge=${CHALLENGE}`
                + `&code_challenge_method=plain`;
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
                if (response?.data?.id) {
                    identity = `${response.data.id}:${response.data.username}`;
                    logger.info(`Data for user '${identity}' is retrieved.`);
                }
            } catch (error) {
                logger.exception(error);
                throw new Error(`Failed to retrieve user data from X: ${error.message}`);
            }
            return {identity, response};
        };

    }
}
