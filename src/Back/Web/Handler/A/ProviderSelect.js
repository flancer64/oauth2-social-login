// MODULE'S IMPORT
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {constants as H2} from 'node:http2';
import Mustache from 'mustache';
import {randomUUID} from 'node:crypto';

// MODULE'S VARS
const {
    HTTP2_HEADER_CONTENT_TYPE,
} = H2;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Handler for processing OAuth2 provider selection requests.
 */
export default class Fl64_OAuth2_Social_Back_Web_Handler_A_ProviderSelect {
    /**
     * Initializes the provider selection handler.
     *
     * @param {TeqFw_Core_Shared_Api_Logger} logger - Logger instance
     * @param {TeqFw_Web_Back_Help_Respond} respond - Error response helper
     * @param {TeqFw_Db_Back_RDb_IConnect} conn - Database connection instance
     * @param {Fl64_OAuth2_Social_Back_Mod_Provider} modProvider - Module for interacting with OAuth2 providers
     * @param {Fl64_OAuth2_Social_Back_Plugin_Registry_Provider} regProviders
     * @param {Fl64_OAuth2_Social_Back_Store_Mem_State} memState
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            TeqFw_Db_Back_RDb_IConnect$: conn,
            Fl64_OAuth2_Social_Back_Mod_Provider$: modProvider,
            Fl64_OAuth2_Social_Back_Plugin_Registry_Provider$: regProviders,
            Fl64_OAuth2_Social_Back_Store_Mem_State$: memState,
        }
    ) {
        // VARS

        // MAIN
        /**
         * Handles the provider selection action.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<void>}
         */
        this.act = async function (req, res) {
            const trx = await conn.startTransaction();
            try {
                // Fetch all available providers from the database
                const allProviders = await modProvider.list({trx});

                const state = randomUUID();
                memState.set({key: state, data: true});
                // Prepare data for rendering the template
                const templateData = {
                    title: 'Authorize OAuth2 Access',
                    description: 'Select a provider to authenticate with your account:',
                    providers: allProviders.map(provider => ({
                        name: provider.name,
                        code: provider.code,
                        url: regProviders.get(provider.code).getAuthorizationUrl({
                            clientId: provider.clientId,
                            state,
                        }),
                    })),
                    cancelText: 'Cancel'
                };

                // Load the Mustache template file
                const filePath = path.resolve(__dirname, '../../../../../web/tmpl/providers.html');
                let template = await readFile(filePath, 'utf-8');

                // Render the template with the data
                const htmlContent = Mustache.render(template, templateData);

                // Commit the transaction after processing
                await trx.commit();
                respond.code200_Ok({
                    res, body: htmlContent, headers: {
                        [HTTP2_HEADER_CONTENT_TYPE]: 'text/html; charset=utf-8',
                    }
                });
            } catch (error) {
                // Log error and send a 500 response if something goes wrong
                logger.exception(error);
                await trx.rollback();
                respond.code500_InternalServerError({res, body: error.message});
            }
        };
    }
}
