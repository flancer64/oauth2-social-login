/**
 * Interface for presenting a provider's functionality in the plugin.
 * Each provider implementation should adhere to this interface
 * to ensure consistent interaction within the OAuth2 plugin.
 *
 * @interface
 */
export default class Fl64_OAuth2_Social_Back_Api_Plugin_Provider_Executor {
    /**
     * @param {TeqFw_Db_Back_RDb_ITrans} trx - The transaction context.
     * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} provider
     * @param {string} code - authorization code
     * @return {Promise<{accessToken:string, response:Object}>}
     */
    async exchangeAuthorizationCode({trx, provider, code}) {};

    /**
     * Retrieves the authorization URL for the provider.
     *
     * @param {Object} params - Parameters required for generating the URL
     * @returns {string} - The authorization URL
     */
    getAuthorizationUrl(params) {}

    /**
     *
     * @param params
     * @returns {Promise<{email:string, response:Object}>}
     */
    async getUserData(params) {}


}
