/**
 * Handler for processing OAuth2 callback requests.
 */
export default class Fl64_OAuth2_Social_Back_Web_Handler_A_Callback {
    /**
     * Initializes the callback handler.
     *
     * @param {typeof import('node:http2')} http2
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {TeqFw_Db_Back_RDb_IConnect} conn - Database connection instance
     * @param {Fl64_OAuth2_Social_Back_Mod_Provider} modProvider - Module for interacting with OAuth2 providers
     * @param {Fl64_OAuth2_Social_Back_Plugin_Registry_Provider} regProvider
     * @param {Fl64_OAuth2_Social_Back_Store_Mem_State} memState
     * @param {Fl64_OAuth2_Social_Back_Api_App_UserManager} mgrUser
     * @param {Fl64_OAuth2_Social_Back_Email_SignIn_Confirm} emailConfirm
     * @param {Fl64_Web_Session_Back_Manager} session
     * @param {Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity} repoIdentity
     */
    constructor(
        {
            'node:http2': http2,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            TeqFw_Db_Back_RDb_IConnect$: conn,
            Fl64_OAuth2_Social_Back_Mod_Provider$: modProvider,
            Fl64_OAuth2_Social_Back_Plugin_Registry_Provider$: regProvider,
            Fl64_OAuth2_Social_Back_Store_Mem_State$: memState,
            Fl64_OAuth2_Social_Back_Api_App_UserManager$: mgrUser,
            Fl64_OAuth2_Social_Back_Email_SignIn_Confirm$: emailConfirm,
            Fl64_Web_Session_Back_Manager$: session,
            Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity$: repoIdentity,
        }
    ) {
        // VARS
        const {
            HTTP2_HEADER_LOCATION,
        } = http2.constants;
        const PARAM_CODE = 'code';
        const PARAM_STATE = 'state';

        // MAIN

        /**
         * Handles the OAuth2 callback action.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<boolean>}
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
                            // Exchange authorization code for an access token
                            const executor = regProvider.get(providerCode);
                            logger.info(`The provider executor is retrieved for '${providerCode}'.`);
                            const {accessToken} = await executor.exchangeAuthorizationCode({
                                trx,
                                provider,
                                code: authCode
                            });
                            if (accessToken) {
                                const {identity, response} = await executor.getUserData({accessToken});
                                if (identity) {
                                    let url; // to redirect after the authentication or registration
                                    let {userId} = await executor.checkIdentity({
                                        trx,
                                        provider,
                                        identity,
                                        userData: response
                                    });
                                    if (!userId) {
                                        logger.info(`The user with identity ${identity} was not found for provider '${providerCode}'.`);
                                        const {id, redirectUrl} = await mgrUser.createUser({
                                            trx,
                                            identity,
                                            extras: {provider, response}
                                        });
                                        userId = id;
                                        url = redirectUrl;
                                        // register a new identity
                                        const dto = repoIdentity.createDto();
                                        dto.provider_ref = provider.id;
                                        dto.user_ref = userId;
                                        dto.uid = identity;
                                        await repoIdentity.createOne({trx, dto});
                                        logger.info(`The user identity ${identity} is registered for user '${userId}' and provider '${providerCode}'.`);
                                    }
                                    const {sessionId, redirectUri} = await session.establish({trx, req, res, userId});
                                    if (sessionId) {
                                        if (!url) {
                                            // Redirect the user if a valid redirect URL is present in the session
                                            const {url: redirect} = await session.retrieveRedirectUrl({
                                                req,
                                                remove: true
                                            });
                                            url = redirect ?? '/';
                                        }
                                        // send the confirmation email w/o await
                                        emailConfirm.perform({userId, email: identity}).catch(logger.exception);
                                    } else {
                                        if (redirectUri) {
                                            url = redirectUri;
                                        }
                                    }
                                    logger.info(`The user #${userId} is redirected to '${url}'.`);
                                    respond.code303_SeeOther({
                                        res, headers: {[HTTP2_HEADER_LOCATION]: url}
                                    });
                                    return true;
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
                    respond.code500_InternalServerError({res, body: error.message});
                    return true;
                }
            }
        };
    }
}
