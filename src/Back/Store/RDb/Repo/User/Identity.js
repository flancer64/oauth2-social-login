/**
 * Repository for managing User Identities in the database.
 * @implements TeqFw_Db_Back_Api_RDb_Repository
 */
export default class Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity {
    /**
     * @param {TeqFw_Db_Back_App_Crud} crud - CRUD engine for database operations.
     * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity} schema - Persistent DTO schema for User Identity.
     */
    constructor(
        {
            TeqFw_Db_Back_App_Crud$: crud,
            Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity$: schema,
        }
    ) {
        /**
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto} [dto]
         * @returns {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto}
         */
        this.createDto = (dto) => schema.createDto(dto);

        /**
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto} [params.dto]
         * @returns {Promise<{primaryKey: Object<string, string|number>}>}
         */
        this.createOne = async function ({trx, dto}) {
            return crud.createOne({schema, trx, dto});
        };

        /**
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.conditions
         * @returns {Promise<{deletedCount: number}>}
         */
        this.deleteMany = async function ({trx, conditions}) {
            return crud.deleteMany({schema, trx, conditions});
        };

        /**
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.key
         * @returns {Promise<{deletedCount: number}>}
         */
        this.deleteOne = async function ({trx, key}) {
            return crud.deleteOne({schema, trx, key});
        };

        /**
         * @returns {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity}
         */
        this.getSchema = () => schema;

        /**
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {TeqFw_Db_Shared_Dto_List_Selection.Dto} [params.selection]
         * @param {Object} [params.conditions]
         * @param {Object<string, 'asc'|'desc'>} [params.sorting]
         * @param {{limit: number, offset: number}} [params.pagination]
         * @returns {Promise<{records: Array<Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto>}>}
         */
        this.readMany = async function ({trx, selection, conditions, sorting, pagination}) {
            return crud.readMany({schema, trx, selection, conditions, sorting, pagination});
        };

        /**
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.key
         * @param {Array<string>} [params.select]
         * @returns {Promise<{record: Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto|null}>}
         */
        this.readOne = async function ({trx, key, select}) {
            return crud.readOne({schema, trx, key, select});
        };

        /**
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.conditions
         * @param {Object} params.updates
         * @returns {Promise<{updatedCount: number}>}
         */
        this.updateMany = async function ({trx, conditions, updates}) {
            return crud.updateMany({schema, trx, conditions, updates});
        };

        /**
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.key
         * @param {Object} params.updates
         * @returns {Promise<{updatedCount: number}>}
         */
        this.updateOne = async function ({trx, key, updates}) {
            return crud.updateOne({schema, trx, key, updates});
        };
    }
}
