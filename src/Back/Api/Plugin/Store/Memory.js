/**
 * Interface for in-memory storage.
 *
 * This is documentation-only code (not executable).
 * TODO: move this interface to `@teqfw/core` (???)
 *
 * @template T
 * @interface
 */
export default class Fl64_OAuth2_Social_Back_Api_Plugin_Store_Memory {
    /**
     * Saves data with a unique key and expiration time.
     * @param {Object} params
     * @param {string} params.key - The unique key identifier.
     * @param {T} params.data - The data to be stored.
     * @param {number} params.expiresAt - The timestamp when the data expires.
     * @returns {void}
     */
    set({key, data, expiresAt}) {}

    /**
     * Retrieves the data associated with the given key.
     * @param {Object} params
     * @param {string} params.key - The unique key identifier.
     * @returns {T|null} - Returns the data object if found, or null if not found or expired.
     */
    get({key}) {}

    /**
     * Deletes the data associated with the given key.
     * @param {Object} params
     * @param {string} params.key - The unique key identifier.
     * @returns {void}
     */
    delete({key}) {}
}
