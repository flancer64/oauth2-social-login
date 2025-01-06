/**
 * Model for managing OAuth2 Login Provider data (domain DTOs) in the RDB.
 *
 * @implements TeqFw_Core_Shared_Api_Model
 */
export default class Fl64_OAuth2_Social_Back_Mod_Provider {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger - instance
     * @param {TeqFw_Db_Back_RDb_IConnect} conn
     * @param {Fl64_OAuth2_Social_Shared_Dto_Provider} dtoProvider
     * @param {Fl64_OAuth2_Social_Back_Convert_Provider} convProvider
     * @param {Fl64_OAuth2_Social_Back_Store_RDb_Repo_Provider} repoProvider
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_RDb_IConnect$: conn,
            Fl64_OAuth2_Social_Shared_Dto_Provider$: dtoProvider,
            Fl64_OAuth2_Social_Back_Convert_Provider$: convProvider,
            Fl64_OAuth2_Social_Back_Store_RDb_Repo_Provider$: repoProvider,
        }
    ) {
        // VARS
        const ATTR = repoProvider.getSchema().getAttributes();

        // MAIN

        /**
         * @type {function(Fl64_OAuth2_Social_Shared_Dto_Provider.Dto=): Fl64_OAuth2_Social_Shared_Dto_Provider.Dto}
         */
        this.composeEntity = dtoProvider.createDto;

        /**
         * @type {function(Fl64_OAuth2_Social_Shared_Dto_Provider.Dto=): Fl64_OAuth2_Social_Shared_Dto_Provider.Dto}
         */
        this.composeItem = dtoProvider.createDto;

        /**
         * Creates a new OAuth2 provider in the RDB.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} dto
         * @returns {Promise<Fl64_OAuth2_Social_Shared_Dto_Provider.Dto>}
         */
        this.create = async function ({trx: trxOuter, dto}) {
            const trx = trxOuter ?? await conn.startTransaction();
            try {
                const {dbProvider} = convProvider.dom2db({provider: dto});
                const {primaryKey: key} = await repoProvider.createOne({trx, dto: dbProvider});
                const {record} = await repoProvider.readOne({trx, key});
                const res = convProvider.db2dom({dbProvider: record});
                if (!trxOuter) await trx.commit();
                logger.info(`OAuth2 provider data for provider #${dbProvider.id} has been created successfully.`);
                return res;
            } catch (error) {
                if (!trxOuter) await trx.rollback();
                logger.error(`Error creating provider: ${error.message}`);
                throw error;
            }
        };

        /**
         * Deletes a provider record from the database.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} dto
         * @returns {Promise<number>}
         */
        this.delete = async function ({trx: trxOuter, dto}) {
            const trx = trxOuter ?? await conn.startTransaction();
            try {
                const {dbProvider} = convProvider.dom2db({provider: dto});
                const key = {[ATTR.ID]: dbProvider.id};
                const {deletedCount} = await repoProvider.deleteOne({trx, key});
                if (!trxOuter) await trx.commit();
                logger.info(`Provider deleted successfully with ID: ${dbProvider.id}`);
                return deletedCount;
            } catch (error) {
                if (!trxOuter) await trx.rollback();
                logger.error(`Error deleting provider: ${error.message}`);
                throw error;
            }
        };

        /**
         * Retrieves a list of all provider records from the database as domain DTOs.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Object} [where]
         * @returns {Promise<Fl64_OAuth2_Social_Shared_Dto_Provider.Dto[]>}
         * @throws {Error}
         */
        this.list = async function ({trx: trxOuter, where} = {}) {
            const trx = trxOuter ?? await conn.startTransaction();
            const result = [];
            try {
                const {records} = await repoProvider.readMany({trx, conditions: where});
                for (const one of records) {
                    result.push(convProvider.db2dom({dbProvider: one}));
                }
                if (!trxOuter) await trx.commit();
            } catch (error) {
                if (!trxOuter) await trx.rollback();
                throw error;
            }
            return result;
        };

        /**
         * Reads provider data by provider reference.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {number} [id]
         * @param {string} [code]
         * @returns {Promise<Fl64_OAuth2_Social_Shared_Dto_Provider.Dto|null>}
         */
        this.read = async function ({trx: trxOuter, id, code}) {
            const trx = trxOuter ?? await conn.startTransaction();
            let result = null;
            try {
                if (id || code) {
                    const key = (id) ? {[ATTR.ID]: id} : {[ATTR.CODE]: code};
                    const {record: dbProvider} = await repoProvider.readOne({trx, key});
                    if (dbProvider) {
                        result = convProvider.db2dom({dbProvider});
                        logger.info(`Provider read successfully with ID: ${result.id}`);
                    } else {
                        logger.info(`Provider with given keys (id/code: ${id ?? ''}/${code ?? ''}) is not found.`);
                    }
                }
                if (!trxOuter) await trx.commit();
            } catch (error) {
                if (!trxOuter) await trx.rollback();
                logger.error(`Error reading provider: ${error.message}`);
                throw error;
            }
            return result;
        };

        /**
         * Updates provider data in the RDB.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} [trx]
         * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} dto
         * @returns {Promise<Fl64_OAuth2_Social_Shared_Dto_Provider.Dto|null>}
         */
        this.update = async function ({trx: trxOuter, dto}) {
            const trx = trxOuter ?? await conn.startTransaction();
            try {
                const key = {[ATTR.ID]: dto.id};
                const {record: dbProvider} = await repoProvider.readOne({trx, key});
                if (dbProvider) {
                    dbProvider.client_id = dto.clientId;
                    dbProvider.client_secret = dto.clientSecret;
                    dbProvider.code = dto.code;
                    dbProvider.status = dto.status;
                    const {updatedCount} = await repoProvider.updateOne({trx, key, updates: dbProvider});
                    if (updatedCount) logger.info(`Provider updated successfully with ID: ${dbProvider.id}`);
                    const {record: updated} = await repoProvider.readOne({trx, key});
                    const res = convProvider.db2dom({dbProvider: updated});
                    if (!trxOuter) await trx.commit();
                    return res;
                } else {
                    logger.info(`Provider not found with ID: ${dto.id}`);
                    if (!trxOuter) await trx.commit();
                    return null;
                }
            } catch (error) {
                if (!trxOuter) await trx.rollback();
                logger.error(`Error updating provider: ${error.message}`);
                throw error;
            }
        };
    }
}
