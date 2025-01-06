/**
 * Converts Domain DTO to/from related DTOs (Persistent, etc.) for OAuth2 Login Provider.
 * @implements TeqFw_Core_Back_Api_Convert
 */
export default class Fl64_OAuth2_Social_Back_Convert_Provider {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {Fl64_OAuth2_Social_Shared_Dto_Provider} domDto
     * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider} rdbDto
     * @param {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Status} STATUS
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            Fl64_OAuth2_Social_Shared_Dto_Provider$: domDto,
            Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider$: rdbDto,
            'Fl64_OAuth2_Social_Shared_Enum_Provider_Status.default': STATUS,
        }
    ) {
        // INSTANCE METHODS
        /**
         * Converts the persistent DTO (RDB) to the domain DTO.
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto} dbProvider
         * @returns {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto}
         */
        this.db2dom = function ({dbProvider}) {
            const res = domDto.createDto();
            if (dbProvider) {
                res.clientId = cast.string(dbProvider.client_id);
                res.clientSecret = cast.string(dbProvider.client_secret);
                res.code = cast.string(dbProvider.code);
                res.dateCreated = cast.date(dbProvider.date_created);
                res.id = cast.int(dbProvider.id);
                res.name = cast.string(dbProvider.name);
                res.status = cast.enum(dbProvider.status, STATUS);
            }
            return res;
        };

        /**
         * The structure of the returned value.
         * @typedef {Object} Dom2RdbResult
         * @property {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto} dbProvider
         * @memberof Fl64_OAuth2_Social_Back_Convert_Provider
         */

        /**
         * Converts the domain DTO to the persistent DTO (RDB).
         * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} provider
         * @returns {Dom2RdbResult}
         */
        this.dom2db = function ({provider}) {
            const dbProvider = rdbDto.createDto();
            if (provider) {
                dbProvider.client_id = cast.string(provider.clientId);
                dbProvider.client_secret = cast.string(provider.clientSecret);
                dbProvider.code = cast.string(provider.code);
                dbProvider.date_created = (provider.dateCreated)
                    ? cast.date(provider.dateCreated) : dbProvider.date_created;
                dbProvider.id = cast.int(provider.id);
                dbProvider.name = cast.string(provider.name);
                dbProvider.status = (provider.status)
                    ? cast.enum(provider.status, STATUS) : dbProvider.status;
            }
            return {dbProvider};
        };
    }
}
