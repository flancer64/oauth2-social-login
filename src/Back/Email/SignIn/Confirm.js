/**
 * Service that confirms the authentication of a user
 * by sending a follow-up notification email.
 *
 * @implements TeqFw_Core_Shared_Api_Service
 */
export default class Fl64_OAuth2_Social_Back_Email_SignIn_Confirm {
    /**
     * @param {Fl64_OAuth2_Social_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {Fl64_Tmpl_Back_Service_Render} servRender
     * @param {Fl64_Tmpl_Back_Api_Adapter} adaptTmpl
     * @param {TeqFw_Email_Back_Act_Send} actSend
     * @param {typeof Fl64_Tmpl_Back_Enum_Type} TYPE
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            Fl64_Tmpl_Back_Service_Render$: servRender,
            Fl64_Tmpl_Back_Api_Adapter$: adaptTmpl,
            TeqFw_Email_Back_Act_Send$: actSend,
            Fl64_Tmpl_Back_Enum_Type$: TYPE,
        }
    ) {
        // VARS
        const TMPL = 'signin/confirm';

        // FUNCS

        /**
         * Renders HTML and plain text email content based on templates.
         * @param {TeqFw_Db_Back_RDb_ITrans}  trx
         * @param {number} userId
         * @returns {Promise<{html:string, text:string, subject:string}>}
         */
        async function prepareContent(trx, userId) {
            const pkg = DEF.NAME;
            const tmpl = TMPL;
            const dto = await adaptTmpl.getEmailContext({pkg, tmpl, userId, trx});
            const localeApp = dto.locale.app;
            const localeUser = dto.locale.user;
            const localePkg = DEF.LOCALE;
            const view = {...dto.view};
            const partials = {...dto.partials};
            const {content: html} = await servRender.perform({
                pkg: DEF.NAME,
                type: TYPE.EMAIL,
                name: TMPL + '/body.html',
                localeUser,
                localeApp,
                localePkg,
                view,
                partials,
            });

            const {content: text} = await servRender.perform({
                pkg: DEF.NAME,
                type: TYPE.EMAIL,
                name: TMPL + '/body.txt',
                localeUser,
                localeApp,
                localePkg,
                view,
                partials,
            });

            const {content: meta} = await servRender.perform({
                pkg: DEF.NAME,
                type: TYPE.EMAIL,
                name: TMPL + '/meta.json',
                localeUser,
                localeApp,
                localePkg,
                view,
                partials,
            });

            const subject = JSON.parse(meta).subject;
            return {html, text, subject};
        }

        // MAIN
        /**
         * Sends a follow-up confirmation email after successful login.
         * @param {object} params - Parameters object.
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {string} params.email
         * @param {number} params.userId
         * @returns {Promise<{resultCode: string}>}
         */
        this.perform = async function ({trx: trxOuter, email, userId}) {
            let resultCode = RESULT_CODES.UNKNOWN_ERROR;
            if (email?.includes('@')) {
                await trxWrapper.execute(trxOuter, async function (trx) {
                    const {html, text, subject} = await prepareContent(trx, userId);
                    const to = email;
                    const {success} = await actSend.act({to, subject, text, html});
                    resultCode = success ? RESULT_CODES.SUCCESS : RESULT_CODES.EMAIL_SEND_FAILED;
                    logger.info(`Sign-in confirmation email sent to user #${userId}`);
                });
            }
            return {resultCode};
        };

        /**
         * Returns the set of result codes used by this service.
         * @return {typeof Fl64_OAuth2_Social_Back_Email_SignIn_Confirm.RESULT_CODES}
         */
        this.getResultCodes = () => RESULT_CODES;
    }
}

// VARS
/**
 * @memberOf Fl64_OAuth2_Social_Back_Email_SignIn_Confirm
 */
const RESULT_CODES = {
    EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
    SUCCESS: 'SUCCESS',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
};
Object.freeze(RESULT_CODES);
