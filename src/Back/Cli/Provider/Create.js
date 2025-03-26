/**
 * @namespace Fl64_OAuth2_Social_Back_Cli_Provider_Create
 */
// MODULE'S IMPORT

// MODULE'S VARS
const NS = 'Fl64_OAuth2_Social_Back_Cli_Provider_Create';
const OPT_CLIENT_ID = 'clientId';
const OPT_CLIENT_SECRET = 'clientSecret';
const OPT_CODE = 'code';
const OPT_NAME = 'name';

// MODULE'S FUNCTIONS
/**
 * Factory for a CLI command to register a new OAuth2 provider.
 *
 * @param {Fl64_OAuth2_Social_Back_Defaults} DEF - Contains global CLI prefix configuration
 * @param {TeqFw_Core_Shared_Api_Logger} logger
 * @param {TeqFw_Core_Back_Api_Dto_Command.Factory} fCommand
 * @param {TeqFw_Core_Back_Api_Dto_Command_Option.Factory} fOpt
 * @param {TeqFw_Core_Back_App} app - Provides lifecycle management for the application
 * @param {TeqFw_Db_Back_RDb_IConnect} conn - Interface for managing database transactions
 * @param {Fl64_OAuth2_Social_Back_Mod_Provider} modProvider - Handles OAuth2 provider-related operations
 * @param {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Status} STATUS
 *
 * @returns {TeqFw_Core_Back_Api_Dto_Command}
 */
export default function Factory(
    {
        Fl64_OAuth2_Social_Back_Defaults$: DEF,
        TeqFw_Core_Shared_Api_Logger$$: logger,
        'TeqFw_Core_Back_Api_Dto_Command.Factory$': fCommand,
        'TeqFw_Core_Back_Api_Dto_Command_Option.Factory$': fOpt,
        TeqFw_Core_Back_App$: app,
        TeqFw_Db_Back_RDb_IConnect$: conn,
        Fl64_OAuth2_Social_Back_Mod_Provider$: modProvider,
        Fl64_OAuth2_Social_Shared_Enum_Provider_Status$: STATUS,
    }
) {
    /**
     * Handles the creation of a new OAuth2 provider.
     *
     * @param {Object} opts - Command-line options provided by the user
     * @returns {Promise<void>}
     */
    async function action(opts) {
        const clientId = opts[OPT_CLIENT_ID];
        const clientSecret = opts[OPT_CLIENT_SECRET];
        const code = opts[OPT_CODE];
        const name = opts[OPT_NAME];

        if (clientId && clientSecret && code && name) {
            logger.info(`Creating new OAuth2 provider '${name}'...`);

            const dto = modProvider.composeEntity();
            dto.clientId = clientId;
            dto.clientSecret = clientSecret;
            dto.code = code;
            dto.name = name;
            dto.status = STATUS.ACTIVE;

            const trx = await conn.startTransaction();
            try {
                const created = await modProvider.create({trx, dto});
                await trx.commit();
                console.log(`\n\nProvider created successfully: ID=${created.id}, CLIENT_ID=${created.clientId}\n\n`);
            } catch (error) {
                await trx.rollback();
                logger.error(`Error creating provider: ${error.message}`);
            }
        } else {
            logger.error('clientId, clientSecret, code, and name must be provided.');
        }

        await app.stop();
    }

    Object.defineProperty(action, 'namespace', {value: NS});

    const res = fCommand.create();
    res.realm = DEF.CLI_PREFIX;
    res.name = 'provider-create';
    res.desc = 'Create a new OAuth2 provider with clientId, clientSecret, code, and name.';
    res.action = action;

    // Define the --clientId option
    const optClientId = fOpt.create();
    optClientId.flags = `-i, --${OPT_CLIENT_ID} <clientId>`;
    optClientId.description = 'The unique client ID provided by the external provider';
    res.opts.push(optClientId);

    // Define the --clientSecret option
    const optClientSecret = fOpt.create();
    optClientSecret.flags = `-s, --${OPT_CLIENT_SECRET} <clientSecret>`;
    optClientSecret.description = 'The secret key provided by the external provider';
    res.opts.push(optClientSecret);

    // Define the --code option
    const optCode = fOpt.create();
    optCode.flags = `-c, --${OPT_CODE} <code>`;
    optCode.description = 'The unique code for the OAuth2 provider';
    res.opts.push(optCode);

    // Define the --name option
    const optName = fOpt.create();
    optName.flags = `-n, --${OPT_NAME} <name>`;
    optName.description = 'The human-readable name for the OAuth2 provider';
    res.opts.push(optName);

    return res;
}
