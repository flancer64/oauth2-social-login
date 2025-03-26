/**
 * Domain DTO for OAuth2 Login Provider data structure.
 * @namespace Fl64_OAuth2_Social_Shared_Dto_Provider
 */

// MODULE'S CLASSES
/**
 * @memberOf Fl64_OAuth2_Social_Shared_Dto_Provider
 */
class Dto {
    /**
     * Client ID issued by the provider for this application.
     * @type {string}
     */
    clientId;

    /**
     * Client secret issued by the provider for this application.
     * @type {string}
     */
    clientSecret;

    /**
     * Unique provider code (e.g., 'google').
     * @type {string}
     */
    code;

    /**
     * Date and time when the record was created.
     * @type {Date}
     */
    dateCreated;

    /**
     * Unique identifier for the provider.
     * @type {number}
     */
    id;

    /**
     * Human-readable name of the provider.
     * @type {string}
     */
    name;

    /**
     * Status of the provider (e.g., 'active', 'inactive').
     * @type {string}
     * @see Fl64_OAuth2_Social_Shared_Enum_Provider_Status
     */
    status;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class Fl64_OAuth2_Social_Shared_Dto_Provider {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Status} STATUS
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            Fl64_OAuth2_Social_Shared_Enum_Provider_Status$: STATUS,
        }
    ) {
        // INSTANCE METHODS
        /**
         * Create a new DTO and populate it with initialization data.
         * @param {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto} [data]
         * @returns {Fl64_OAuth2_Social_Shared_Dto_Provider.Dto}
         */
        this.createDto = function (data) {
            // Create new DTO and populate with initial data
            const res = Object.assign(new Dto(), data);

            // Cast known attributes
            res.clientId = cast.string(data?.clientId);
            res.clientSecret = cast.string(data?.clientSecret);
            res.code = cast.string(data?.code);
            res.dateCreated = cast.date(data?.dateCreated);
            res.id = cast.int(data?.id);
            res.name = cast.string(data?.name);
            res.status = cast.enum(data?.status, STATUS);

            return res;
        };
    }
}
