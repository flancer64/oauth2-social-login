/**
 * Interface for user management in the application.
 *
 * This is a documentation-only interface (not executable).
 *
 * @interface
 */
export default class Fl64_OAuth2_Social_Back_Api_App_UserManager {
    /**
     * Creates a new user in the application's database.
     * @param {Object} params
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - The transaction context.
     * @param {string} params.identity - Unique identifier assigned to the user by the provider.
     * @param {Object} [params.extras] - Additional user attributes (e.g., name, avatar).
     * @returns {Promise<{id: number}>} - The unique identifier of the created user.
     */
    async createUser({trx, identity, extras}) {}
}
