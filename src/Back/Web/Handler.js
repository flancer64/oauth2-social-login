/**
 * Handles requests for the 'fl64-oauth2-social' namespace (OAuth2 operations).
 */
import {constants as H2} from 'node:http2';

const {
    HTTP2_METHOD_GET,
    HTTP2_METHOD_POST,
} = H2;

/**
 * Dispatcher for handling OAuth2-related HTTP requests.
 */
export default class Fl64_OAuth2_Social_Back_Web_Handler {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Web_Back_App_Server_Respond} respond
     * @param {Fl64_OAuth2_Social_Back_Web_Handler_A_ProviderSelect} aProviderSelect
     * @param {Fl64_OAuth2_Social_Back_Web_Handler_A_Callback} aCallback
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_App_Server_Respond$: respond,
            Fl64_OAuth2_Social_Back_Web_Handler_A_ProviderSelect$: aProviderSelect,
            Fl64_OAuth2_Social_Back_Web_Handler_A_Callback$: aCallback,
        }
    ) {
        /**
         * Handles incoming HTTP requests and delegates processing to specific handlers.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res
         */
        async function process(req, res) {
            try {
                const fullPath = req.url.split('?')[0];
                const baseIndex = fullPath.indexOf(DEF.SHARED.SPACE);
                const relativePath = fullPath.slice(baseIndex + DEF.SHARED.SPACE.length + 1);
                const endpoint = relativePath.split('/')[0];

                switch (endpoint) {
                    case 'provider-select':
                        await aProviderSelect.act(req, res);
                        break;
                    case 'callback':
                        await aCallback.act(req, res);
                        break;
                    default:
                        // Endpoint not recognized; response handled elsewhere
                        break;
                }
            } catch (error) {
                logger.exception(error);
                respond.status500(res, error);
            }
        }

        /**
         * Provides the function to process requests.
         * @returns {Function}
         */
        this.getProcessor = () => process;

        /**
         * Placeholder for initialization logic.
         */
        this.init = async function () { };

        /**
         * Checks if the request can be handled by this instance.
         *
         * @param {Object} options
         * @param {string} options.method
         * @param {Object} options.address
         * @returns {boolean}
         */
        this.canProcess = function ({method, address} = {}) {
            return (
                ((method === HTTP2_METHOD_GET) || (method === HTTP2_METHOD_POST))
                && (address?.space === DEF.SHARED.SPACE)
            );
        };
    }
}
