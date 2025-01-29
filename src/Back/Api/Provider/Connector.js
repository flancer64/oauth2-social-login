/**
 * Interface for presenting a provider's functionality in the plugin.
 * Each provider implementation should adhere to this interface
 * to ensure consistent interaction within the OAuth2 plugin.
 *
 * @interface
 */
export default class Fl64_OAuth2_Social_Back_Api_Provider_Connector {
    /**
     *
     * @param {Object} params
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - The transaction context.
     * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} params.provider
     * @param {string} params.identity
     * @param {Object} params.userData
     * @returns {Promise<{userId: number}>} - The numeric identifier of the found user if exists.
     */
    async checkIdentity({trx, provider, identity, userData}) {}

    /**
     * Exchanges an authorization code for an access token.
     *
     * @param {Object} params
     * @param {TeqFw_Db_Back_RDb_ITrans} params.trx - The transaction context.
     * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} params.provider - The provider DTO.
     * @param {string} params.code - The authorization code.
     * @return {Promise<{accessToken: string, response: Object}>}
     */
    async exchangeAuthorizationCode({trx, provider, code}) {};

    /**
     * Retrieves the authorization URL for the provider.
     *
     * @param {Object} params - Parameters required for generating the URL
     * @param {string} params.clientId
     * @param {string} params.state
     * @returns {string} - The authorization URL
     */
    getAuthorizationUrl({clientId, state}) {}

    /**
     * Retrieves user data from the provider.
     *
     * @param {Object} params - Parameters required for fetching user data.
     * @param {string} params.accessToken - The access token obtained from the provider.
     * @returns {Promise<{identity: string, response: Object}>} - User data and raw response from the provider.
     */
    async getUserData({accessToken}) {}


}
