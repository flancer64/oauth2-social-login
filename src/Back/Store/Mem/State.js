/**
 * Class for in-memory storage of CSRF states with automatic cleanup.
 * @implements TeqFw_Core_Shared_Api_Store_Memory
 */
export default class Fl64_OAuth2_Social_Back_Store_Mem_State {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger
        }
    ) {
        // VARS
        const store = new Map(); // Internal storage for states
        let cleanupInterval = null;

        // FUNCS
        /**
         * Cleans up expired states from the store.
         * @returns {void}
         */
        const cleanupExpired = function () {
            const now = Date.now();
            let removedCount = 0;

            for (const [key, {expiresAt}] of store.entries()) {
                if (expiresAt <= now) {
                    store.delete(key);
                    removedCount++;
                }
            }

            if (removedCount > 0) {
                logger.info(`Cleaned up ${removedCount} expired state(s).`);
            }
        };

        // MAIN

        this.cleanup = function () {
            if (cleanupInterval) clearInterval(cleanupInterval);
            logger.info(`'${this.constructor.name}' is cleaned.`);
        };

        /**
         * Deletes the data associated with the given key.
         * @param {Object} params
         * @param {string} params.key - The unique key identifier.
         * @returns {void}
         */
        this.delete = function ({key}) {
            if (store.delete(key)) {
                logger.info(`State removed for key: ${key}`);
            } else {
                logger.info(`State not found for removal: ${key}`);
            }
        };

        /**
         * Retrieves the data associated with the given key.
         * @param {Object} params
         * @param {string} params.key - The unique key identifier.
         * @returns {boolean} - Returns the boolean data if found, or false if not found or expired.
         */
        this.get = function ({key}) {
            let result = false;
            const entry = store.get(key);
            if (entry) {
                if (entry.expiresAt > Date.now()) {
                    result = entry.data;
                } else {
                    store.delete(key);
                    logger.info(`State expired for key: ${key}`);
                }
            } else {
                logger.info(`State not found for key: ${key}`);
            }

            return result;
        };

        this.has = function ({key}) {
            const entry = store.get(key);
            return !!(entry && entry.expiresAt > Date.now());
        };

        /**
         * Saves a state with a unique key and expiration time.
         * @param {Object} params
         * @param {string} params.key - The unique key identifier.
         * @param {boolean} params.data - The boolean value to be stored.
         * @param {number} [params.expiresAt] - The timestamp when the data expires. Defaults to 10 minutes from now.
         * @returns {void}
         */
        this.set = function ({key, data, expiresAt}) {
            if (!expiresAt) expiresAt = Date.now() + 10 * 60 * 1000;
            store.set(key, {data, expiresAt});
            logger.info(`State stored with key: ${key}, expires at: ${new Date(expiresAt).toISOString()}`);
        };

        // Start automatic cleanup
        cleanupInterval = setInterval(cleanupExpired, 60000); // Every 1 minute
    }
}
