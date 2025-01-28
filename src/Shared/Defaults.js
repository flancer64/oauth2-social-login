/**
 * Plugin constants (hardcoded configuration) for shared code.
 */
export default class Fl64_OAuth2_Social_Shared_Defaults {

    NAME = '@flancer64/oauth2-social-login';

    /** @type {TeqFw_Web_Shared_Defaults} */
    MOD_WEB;

    ROUTE_CALLBACK = 'callback';
    ROUTE_SELECT = 'provider-select';

    SPACE = 'fl64-oauth2-social';

    constructor(
        {
            TeqFw_Web_Shared_Defaults$: MOD_WEB
        }
    ) {
        this.MOD_WEB = MOD_WEB;
        Object.freeze(this);
    }
}
