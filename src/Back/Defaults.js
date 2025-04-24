/**
 * Plugin constants (hardcoded configuration) for frontend code.
 */
export default class Fl64_OAuth2_Social_Back_Defaults {
    CLI_PREFIX = 'fl64-oauth-social'; // prefix for CLI actions

    LOCALE = 'en';

    /** @type {TeqFw_Web_Back_Defaults} */
    MOD_WEB;

    NAME;

    /** @type {Fl64_OAuth2_Social_Shared_Defaults} */
    SHARED;

    /**
     * @param {TeqFw_Web_Back_Defaults} MOD_WEB
     * @param {Fl64_OAuth2_Social_Shared_Defaults} SHARED
     */
    constructor(
        {
            TeqFw_Web_Back_Defaults$: MOD_WEB,
            Fl64_OAuth2_Social_Shared_Defaults$: SHARED,
        }
    ) {

        this.MOD_WEB = MOD_WEB;
        this.SHARED = SHARED;

        this.NAME = SHARED.NAME;

        Object.freeze(this);
    }
}
