/**
 * TODO: add description
 */
export default class Fl64_OAuth2_Social_Back_Plugin_Registry_Provider {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {Fl64_OAuth2_Social_Back_Mod_Provider_Executor_GitHub} execGitHub
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            Fl64_OAuth2_Social_Back_Mod_Provider_Executor_GitHub$: execGitHub,
        }
    ) {
        // VARS
        const store = new Map();
        store.set('github', execGitHub);

        // FUNCS

        // MAIN
        /**
         * Registers a provider in the plugin registry.
         * @param {string} code - The unique identifier for the provider
         * @param {Fl64_OAuth2_Social_Back_Api_Plugin_Provider_Executor} instance - Instance of the provider
         */
        this.set = function (code, instance) {
            store.set(code, instance);
            logger.info(`Provider ${code} registered.`);
        };

        /**
         * Retrieves the provider implementation based on the provider code.
         * @param {string} code - The unique identifier for the provider
         * @returns {Fl64_OAuth2_Social_Back_Api_Plugin_Provider_Executor|null} - The provider instance or null if not found
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
