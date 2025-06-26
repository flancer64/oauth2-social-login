/**
 * Dispatcher for handling OAuth2-related HTTP requests.
 * @implements Fl32_Web_Back_Api_Handler
 */
export default class Fl64_OAuth2_Social_Back_Web_Handler {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {typeof import('node:http2')} http2
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl32_Web_Back_Dto_Handler_Info} dtoInfo
     * @param {typeof Fl32_Web_Back_Enum_Stage} STAGE
     * @param {Fl64_OAuth2_Social_Back_Web_Handler_A_ProviderSelect} aProviderSelect
     * @param {Fl64_OAuth2_Social_Back_Web_Handler_A_Callback} aCallback
     */
    constructor(
        {
            'node:http2': http2,
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            Fl32_Web_Back_Dto_Handler_Info$: dtoInfo,
            Fl32_Web_Back_Enum_Stage$: STAGE,
            Fl64_OAuth2_Social_Back_Web_Handler_A_ProviderSelect$: aProviderSelect,
            Fl64_OAuth2_Social_Back_Web_Handler_A_Callback$: aCallback,
        }
    ) {
        // VARS
        const {
            HTTP2_METHOD_GET,
            HTTP2_METHOD_POST,
        } = http2.constants;

        const _info = dtoInfo.create();
        _info.name = this.constructor.name;
        _info.stage = STAGE.PROCESS;
        _info.before = ['Fl32_Cms_Back_Web_Handler_Template'];
        Object.freeze(_info);

        // FUNCS
        /**
         * Handles incoming HTTP requests and delegates processing to specific handlers.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res
         * @return {Promise<boolean>}
         */
        async function process(req, res) {
            try {
                const fullPath = req.url.split('?')[0];
                const baseIndex = fullPath.indexOf(DEF.SHARED.SPACE);
                const relativePath = fullPath.slice(baseIndex + DEF.SHARED.SPACE.length + 1);
                const endpoint = relativePath.split('/')[0];

                switch (endpoint) {
                    case DEF.SHARED.ROUTE_SELECT:
                        return await aProviderSelect.act(req, res);
                    case DEF.SHARED.ROUTE_CALLBACK:
                        return await aCallback.act(req, res);
                    default:
                        // Endpoint not recognized; response handled elsewhere
                        break;
                }
            } catch (error) {
                logger.exception(error);
                respond.code500_InternalServerError({res, body: error.message});
            }
            return false;
        }

        /**
         * Provides the function to process requests.
         * @returns {Function}
         */
        this.getProcessor = () => process;

        /** @returns {Fl32_Web_Back_Dto_Handler_Info.Dto} */
        this.getRegistrationInfo = () => _info;

        this.handle = async function (req, res) {
            return process(req, res);
        };

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
