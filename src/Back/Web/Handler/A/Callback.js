// MODULE'S VARS
const PARAM_CODE = 'code';
const PARAM_STATE = 'state';

/**
 * Handler for processing OAuth2 callback requests.
 */
export default class Fl64_OAuth2_Social_Back_Web_Handler_A_Callback {
    /**
     * Initializes the callback handler.
     *
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance
     * @param {TeqFw_Web_Back_App_Server_Respond} respond - Error response helper
     * @param {TeqFw_Db_Back_RDb_IConnect} conn - Database connection instance
     * @param {Fl64_OAuth2_Social_Back_Plugin_Helper} hlpPlugin
     * @param {Fl64_OAuth2_Social_Back_Mod_Provider} modProvider - Module for interacting with OAuth2 providers
     * @param {Fl64_OAuth2_Social_Back_Plugin_Registry_Provider} regProvider
     * @param {Fl64_OAuth2_Social_Back_Store_Mem_State} memState
     * @param {Fl64_OAuth2_Social_Back_Api_App_UserManager} mgrUser
     * @param {Fl64_Web_Session_Back_Manager} mgrSession
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_App_Server_Respond$: respond,
            TeqFw_Db_Back_RDb_IConnect$: conn,
            Fl64_OAuth2_Social_Back_Plugin_Helper$: hlpPlugin,
            Fl64_OAuth2_Social_Back_Mod_Provider$: modProvider,
            Fl64_OAuth2_Social_Back_Plugin_Registry_Provider$: regProvider,
            Fl64_OAuth2_Social_Back_Store_Mem_State$: memState,
            Fl64_OAuth2_Social_Back_Api_App_UserManager$: mgrUser,
            Fl64_Web_Session_Back_Manager$: mgrSession,
        }
    ) {
        // MAIN

        /**
         * Handles the OAuth2 callback action.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<void>}
         */
        this.act = async function (req, res) {
            const parts = req.url.split('?');
            const urlParams = new URLSearchParams(parts[1]);
            const providerCode = parts[0].split('/')[3]; // Extract provider code from the URL
            const authCode = urlParams.get(PARAM_CODE);
            const state = urlParams.get(PARAM_STATE);

            if (providerCode && authCode && state) {
                const trx = await conn.startTransaction();
                try {
                    // Validate state and retrieve provider details
                    const isStateAllowed = memState.get({key: state});
                    if (isStateAllowed) {
                        logger.info(`The callback is allowed for authentication provider '${providerCode}'.`);
                        const provider = await modProvider.read({trx, code: providerCode});
                        if (provider) {
                            // Exchange authorization code for access token
                            const executor = regProvider.get(providerCode);
                            logger.info(`The provider executor is retrieved for '${providerCode}'.`);
                            const {accessToken} = await executor.exchangeAuthorizationCode({provider, code: authCode});
                            if (accessToken) {
                                const {email, response} = await executor.getUserData({accessToken});
                                if (email) {
                                    let {userId} = await mgrUser.findUser({trx, email});
                                    if (!userId) {
                                        const {id} = await mgrUser.createUser({trx, email});
                                        userId = id;
                                    }
                                    const {sessionUuid} = await mgrSession.establish({trx, req, res, userId});
                                    const url = await hlpPlugin.getUrlSessionSucceed({
                                        trx,
                                        sessionId: sessionUuid,
                                        provider,
                                        httpRequest: req,
                                        httpResponse: res
                                    });
                                    respond.status303(res, url);
                                    debugger
                                }
                            }
                        }
                    } else {
                        // TODO: do nothing
                    }
                    // Commit the transaction after processing
                    await trx.commit();

                } catch (error) {
                    // Log error and send a 500 response if something goes wrong
                    logger.exception(error);
                    await trx.rollback();
                    respond.status500(res, error?.message);
                }
            }
        };
    }
}
