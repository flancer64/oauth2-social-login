/**
 * Persistent DTO with metadata for the RDB entity: OAuth2 Login Provider.
 * @namespace Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider
 */

// MODULE'S VARS

/**
 * Path to the entity in the plugin's DEM.
 *
 * @type {string}
 */
const ENTITY = '/fl64/oauth/social/provider';

/**
 * Attribute mappings for the entity.
 * @memberOf Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider
 * @type {Object}
 */
const ATTR = {
    CLIENT_ID: 'client_id',
    CLIENT_SECRET: 'client_secret',
    CODE: 'code',
    DATE_CREATED: 'date_created',
    ID: 'id',
    NAME: 'name',
    STATUS: 'status',
};
Object.freeze(ATTR);

// MODULE'S CLASSES

/**
 * DTO class representing the persistent structure of the OAuth2 Login Provider entity.
 * @memberOf Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider
 */
class Dto {
    /**
     * Client ID issued by the provider for this application.
     *
     * @type {string}
     */
    client_id;

    /**
     * Client secret issued by the provider for this application.
     *
     * @type {string}
     */
    client_secret;

    /**
     * Unique provider code (e.g., 'google').
     *
     * @type {string}
     */
    code;

    /**
     * Date and time when the record was created.
     *
     * @type {Date}
     */
    date_created;

    /**
     * Internal numeric identifier for the provider.
     *
     * @type {number}
     */
    id;

    /**
     * Human-readable name of the provider.
     *
     * @type {string}
     */
    name;

    /**
     * Status of the provider (e.g., 'active', 'inactive').
     *
     * @type {string}
     * @see Fl64_OAuth2_Social_Shared_Enum_Provider_Status
     */
    status;
}

/**
 * Implements metadata and utility methods for the OAuth2 Login Provider entity.
 * @implements TeqFw_Db_Back_Api_RDb_Schema_Object
 */
export default class Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider {
    /**
     * Constructor for the OAuth2 Login Provider persistent DTO class.
     *
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Util_Cast} cast - Utility for type casting.
     * @param {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Status} STATUS - Enum for provider statuses.
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Util_Cast$: cast,
            Fl64_OAuth2_Social_Shared_Enum_Provider_Status$: STATUS,
        }
    ) {
        // INSTANCE METHODS

        /**
         * Creates a new DTO object with casted properties.
         *
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto|Object} [data] - Input data for the DTO.
         * @returns {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto} - Casted DTO instance.
         */
        this.createDto = function (data) {
            const res = new Dto();
            res.date_created = new Date();
            res.status = STATUS.ACTIVE;
            if (data) {
                res.client_id = cast.string(data.client_id);
                res.client_secret = cast.string(data.client_secret);
                res.code = cast.string(data.code);
                res.date_created = data.date_created ? cast.date(data?.date_created) : res.date_created;
                res.id = cast.int(data.id);
                res.name = cast.string(data.name);
                res.status = (data.status) ? cast.enum(data.status, STATUS) : res.status;
            }
            return res;
        };

        /**
         * Returns the attribute map for the entity.
         *
         * @returns {Object}
         */
        this.getAttributes = () => ATTR;

        /**
         * Returns the entity's path in the DEM.
         *
         * @returns {string}
         */
        this.getEntityName = () => `${DEF.NAME}${ENTITY}`;

        /**
         * Returns the primary key attributes for the entity.
         *
         * @returns {Array<string>}
         */
        this.getPrimaryKey = () => [ATTR.ID];
    }
}
