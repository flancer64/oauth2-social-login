/**
 * Model for managing OAuth2 Login Provider data in the RDB.
 *
 * @implements TeqFw_Core_Shared_Api_Model
 */
export default class Fl64_OAuth2_Social_Back_Mod_Provider {
    /**
     * @param {TeqFw_Core_Shared_Api_Logger} logger - instance
     * @param {TeqFw_Db_Back_RDb_IConnect} conn
     * @param {Fl64_OAuth2_Social_Shared_Dto_Provider} dtoProvider
     * @param {Fl64_OAuth2_Social_Back_Convert_Provider} convProvider
     * @param {TeqFw_Db_Back_Api_RDb_CrudEngine} crud
     * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider} rdbProvider
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_RDb_IConnect$: conn,
            Fl64_OAuth2_Social_Shared_Dto_Provider$: dtoProvider,
            Fl64_OAuth2_Social_Back_Convert_Provider$: convProvider,
            TeqFw_Db_Back_Api_RDb_CrudEngine$: crud,
            Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider$: rdbProvider,
        }
    ) {
        // VARS
        const ATTR = rdbProvider.getAttributes();

        // FUNCS

        /**
         * Executes the creation of a new provider in the database.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} trx - The transaction context.
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto} dbProvider - The provider DTO containing data for the new record.
         * @returns {Promise<{id:number}>} - The ID of the newly created provider record.
         */
        async function createEntity({trx, dbProvider}) {
            const {[ATTR.ID]: id} = await crud.create(trx, rdbProvider, dbProvider);
            return {id};
        }

        /**
         * Deletes a provider from the database.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto} [dbProvider]
         * @returns {Promise<number>} - Number of deleted records
         */
        async function deleteEntity({trx, dbProvider}) {
            return await crud.deleteOne(trx, rdbProvider, {[ATTR.ID]: dbProvider.id});
        }

        /**
         * Reads a provider from the database by key.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {number} [id]
         * @param {string} [code]
         * @returns {Promise<{dbProvider:Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto}>} - Object containing the provider data or an empty object if not found.
         */
        async function readEntity({trx, id, code}) {
            let dbProvider;
            let key = null;

            if (id !== undefined) {
                key = id;
            } else if (code !== undefined) {
                key = {[ATTR.CODE]: code};
            }

            if (key) dbProvider = await crud.readOne(trx, rdbProvider, key);
            return {dbProvider};
        }

        /**
         * Updates a provider record in the database.
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto} dbProvider
         * @returns {Promise<void>}
         */
        async function updateEntity({trx, dbProvider}) {
            await crud.updateOne(trx, rdbProvider, dbProvider);
        }

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
        this.create = async function ({trx, dto}) {
            const trxLocal = trx ?? await conn.startTransaction();
            try {
                const {dbProvider} = convProvider.dom2db({provider: dto});
                const {id} = await createEntity({trx: trxLocal, dbProvider});
                const {dbProvider: createdProvider} = await readEntity({trx: trxLocal, id});
                const res = convProvider.db2dom({dbProvider: createdProvider});
                if (!trx) await trxLocal.commit();
                logger.info(`OAuth2 provider data for provider #${createdProvider.id} has been created successfully.`);
                return res;
            } catch (error) {
                if (!trx) await trxLocal.rollback();
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
        this.delete = async function ({trx, dto}) {
            const trxLocal = trx ?? await conn.startTransaction();
            try {
                const {dbProvider} = convProvider.dom2db({provider: dto});
                const res = await deleteEntity({trx: trxLocal, dbProvider});
                if (!trx) await trxLocal.commit();
                logger.info(`Provider deleted successfully with ID: ${dbProvider.id}`);
                return res;
            } catch (error) {
                if (!trx) await trxLocal.rollback();
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
        this.list = async function ({trx, where} = {}) {
            const trxLocal = trx ?? await conn.startTransaction();
            const result = [];
            try {
                const all = await crud.readSet(trxLocal, rdbProvider, where);
                for (const one of all) {
                    result.push(convProvider.db2dom({dbProvider: one}));
                }
                if (!trx) await trxLocal.commit();
            } catch (error) {
                if (!trx) await trxLocal.rollback();
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
        this.read = async function ({trx, id, code}) {
            const trxLocal = trx ?? await conn.startTransaction();
            let result = null;

            try {
                if (id || code) {
                    const {dbProvider} = await readEntity({trx: trxLocal, id, code});
                    if (dbProvider) {
                        result = convProvider.db2dom({dbProvider});
                        logger.info(`Provider read successfully with ID: ${result.id}`);
                    } else {
                        logger.info(`Provider with given keys (id/code: ${id ?? ''}/${code ?? ''}) is not found.`);
                    }
                }
                if (!trx) await trxLocal.commit();
            } catch (error) {
                if (!trx) await trxLocal.rollback();
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
        this.update = async function ({trx, dto}) {
            const trxLocal = trx ?? await conn.startTransaction();
            try {
                const {dbProvider} = await readEntity({trx: trxLocal, id: dto.id});
                if (dbProvider) {
                    dbProvider.client_id = dto.clientId;
                    dbProvider.client_secret = dto.clientSecret;
                    dbProvider.code = dto.code;
                    dbProvider.status = dto.status;
                    await updateEntity({trx: trxLocal, dbProvider});
                    logger.info(`Provider updated successfully with ID: ${dbProvider.id}`);
                    const res = convProvider.db2dom({dbProvider});
                    if (!trx) await trxLocal.commit();
                    return res;
                } else {
                    logger.info(`Provider not found with ID: ${dto.id}`);
                    if (!trx) await trxLocal.commit();
                    return null;
                }
            } catch (error) {
                if (!trx) await trxLocal.rollback();
                logger.error(`Error updating provider: ${error.message}`);
                throw error;
            }
        };
    }
}
