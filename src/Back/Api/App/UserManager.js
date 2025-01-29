/**
 * Interface for user management in the application.
 *
 * This is a documentation-only interface (not executable).
 *
 * @interface
 */
export default class Fl64_OAuth2_Social_Back_Api_App_UserManager {
    /**
     * Finds a user in the application's database by criteria.
     * @param {Object} params
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - The transaction context.
     * @param {string} [params.email] - The email address of the user.
     * @param {number} [params.id] - The unique identifier of the user.
     * @returns {Promise<Object|null>} - The user object if found, or null if not found.
     * @deprecated we have a `/fl64/oauth/social/user/identity` table locally
     */
    async findUser({trx, email, id}) {}

    /**
     * Creates a new user in the application's database.
     * @param {Object} params
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - The transaction context.
     * @param {string} params.identity - Unique identifier assigned to the user by the provider.
     * @param {Object} [params.extras] - Additional user attributes (e.g., name, avatar).
     * @returns {Promise<{id: number}>} - The unique identifier of the created user.
     */
    async createUser({trx, identity, extras}) {}

    /**
     * Updates an existing user's information in the application's database.
     * @param {Object} params
     * @param {number} params.id - The unique identifier of the user.
     * @param {Object} [params.extras] - Additional attributes to update (e.g., name, avatar).
     * @returns {Promise<Object>} - The updated user object.
     */
    async updateUser({trx, id, extras}) {}
}
