/**
 * Persistent DTO with metadata for the RDB entity: User Identity.
 * @namespace Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity
 */

// MODULE'S VARS

/**
 * Path to the entity in the plugin's DEM.
 *
 * @type {string}
 */
const ENTITY = '/fl64/oauth/social/user/identity';

/**
 * Attribute mappings for the entity.
 * @memberOf Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity
 */
const ATTR = {
    PROVIDER_REF: 'provider_ref',
    UID: 'uid',
    USER_REF: 'user_ref',
};
Object.freeze(ATTR);

// MODULE'S CLASSES

/**
 * DTO class representing the persistent structure of the User Identity entity.
 * @memberOf Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity
 */
class Dto {
    /**
     * Reference to the provider issuing the user ID.
     *
     * @type {number}
     */
    provider_ref;

    /**
     * Unique identifier assigned to the user by the provider.
     *
     * @type {string}
     */
    uid;

    /**
     * Reference to the user in the system.
     *
     * @type {number}
     */
    user_ref;
}

/**
 * Implements metadata and utility methods for the User Identity entity.
 * @implements TeqFw_Db_Back_Api_RDb_Schema_Object
 */
export default class Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity {
    /**
     * Constructor for the User Identity persistent DTO class.
     *
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Util_Cast$: cast
        }
    ) {
        /**
         * @param {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto|Object} [data]
         * @returns {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto}
         */
        this.createDto = function (data) {
            const res = new Dto();
            if (data) {
                res.provider_ref = cast.int(data?.provider_ref);
                res.uid = cast.string(data?.uid);
                res.user_ref = cast.int(data?.user_ref);
            }
            return res;
        };

        /**
         * Returns the attribute map for the entity.
         *
         * @returns {typeof Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.ATTR}
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
        this.getPrimaryKey = () => [ATTR.PROVIDER_REF, ATTR.UID];
    }
}
