/**
 * Registry for OAuth2 providers in the plugin.
 * Allows registering and retrieving provider implementations by their unique codes.
 */
export default class Fl64_OAuth2_Social_Back_Plugin_Registry_Provider {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {Fl64_OAuth2_Social_Back_Provider_GitHub} providerGitHub
     * @param {Fl64_OAuth2_Social_Back_Provider_Google} providerGoogle
     * @param {Fl64_OAuth2_Social_Back_Provider_X} providerX
     * @param {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Code} CODE
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            Fl64_OAuth2_Social_Back_Provider_GitHub$: providerGitHub,
            Fl64_OAuth2_Social_Back_Provider_Google$: providerGoogle,
            Fl64_OAuth2_Social_Back_Provider_X$: providerX,
            Fl64_OAuth2_Social_Shared_Enum_Provider_Code$: CODE,
        }
    ) {
        // VARS
        const store = new Map();
        store.set(CODE.GITHUB, providerGitHub);
        store.set(CODE.GOOGLE, providerGoogle);
        store.set(CODE.X, providerX);

        // FUNCS

        // MAIN
        /**
         * Registers a provider in the plugin registry.
         * @param {string} code - The unique identifier for the provider
         * @param {Fl64_OAuth2_Social_Back_Api_Provider_Connector} instance - Instance of the provider
         */
        this.set = function (code, instance) {
            store.set(code, instance);
            logger.info(`Provider ${code} is registered.`);
        };

        /**
         * Retrieves the provider implementation based on the provider code.
         * @param {string} code - The unique identifier for the provider
         * @returns {Fl64_OAuth2_Social_Back_Api_Provider_Connector|null} - The provider instance or null if not found
         */
        this.get = function (code) {
            const provider = store.get(code);
            if (!provider) {
                logger.error(`Provider ${code} not found.`);
            }
            return provider || null;
        };
    }
}
