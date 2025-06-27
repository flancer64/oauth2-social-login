import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbDisconnect, dbReset, initConfig} from '../../../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

// SETUP ENVIRONMENT
/** @type {Fl64_OAuth2_Social_Back_Web_Handler_A_Callback} */
const handlerCallback = await container.get('Fl64_OAuth2_Social_Back_Web_Handler_A_Callback$');
/** @type {Fl64_OAuth2_Social_Back_Mod_Provider} */
const modProvider = await container.get('Fl64_OAuth2_Social_Back_Mod_Provider$');
/** @type {Fl64_OAuth2_Social_Back_Store_Mem_State} */
const memState = await container.get('Fl64_OAuth2_Social_Back_Store_Mem_State$');
/** @type {Fl64_OAuth2_Social_Back_Api_App_UserManager} */
const mgrUser = await container.get('Fl64_OAuth2_Social_Back_Api_App_UserManager$');
/** @type {Fl64_OAuth2_Social_Back_Provider_GitHub} */
const executorGitHub = await container.get('Fl64_OAuth2_Social_Back_Provider_GitHub$');

const PROVIDER_CODE = 'github';
const CALLBACK_STATE = 'test-state';
const TEST_EMAIL = 'testuser@example.com';

// Test Suite for OAuth2 Callback Handler
describe('Fl64_OAuth2_Social_Back_Web_Handler_A_Callback', () => {
    before(async () => {
        await dbReset(container);
        await dbConnect(container);

        memState.set({key: CALLBACK_STATE, data: true});
        modProvider.read = async () => {
            return {};
        };
        executorGitHub.exchangeAuthorizationCode = async () => {
            return {accessToken: 'access-token'};
        };
        executorGitHub.getUserData = async () => {
            return {email: TEST_EMAIL};
        };
    });

    after(async () => {
        await dbDisconnect(container);
        memState.cleanup();
    });

    it('should process a valid callback request and create a new user session', async () => {
        const req = {};
        req.url = `/fl64-oauth2-social/callback/${PROVIDER_CODE}?code=valid-code&state=${CALLBACK_STATE}`;

        const res = {};
        res.write = function () {}; // Mock write to suppress real writes
        res.end = function () {};   // Mock end to suppress real ends


        // Run the handler
        await handlerCallback.act(req, res);

        // Verify user creation
        const user = await mgrUser.findUser({email: TEST_EMAIL});
        assert.ok(user, 'User should be created successfully.');

        // Verify session creation
        const session = await mgrUser.findSession({userId: user.id});
        assert.ok(session, 'Session should be created successfully.');
    });

    it('should reject callback with invalid state', async () => {
        const req = new IncomingMessage();
        req.url = `/fl64-oauth2-social/callback/${PROVIDER_CODE}?code=valid-code&state=invalid-state`;

        const res = new ServerResponse(req);
        res.write = function () {}; // Mock write to suppress real writes
        res.end = function () {};   // Mock end to suppress real ends

        await handlerCallback.act(req, res);

        // Verify that no user is created
        const user = await mgrUser.findUser({email: TEST_EMAIL});
        assert.ok(!user, 'User should not be created with invalid state.');
    });

    it('should handle errors gracefully and roll back the transaction', async () => {
        const req = new IncomingMessage();
        req.url = `/fl64-oauth2-social/callback/${PROVIDER_CODE}?code=invalid-code&state=${CALLBACK_STATE}`;

        const res = new ServerResponse(req);
        res.write = function () {}; // Mock write to suppress real writes
        res.end = function () {};   // Mock end to suppress real ends

        // Mock executor to throw an error during token exchange
        const mockExecutor = await container.get(`Fl64_OAuth2_Social_Back_Provider_${PROVIDER_CODE}$`);
        mockExecutor.exchangeAuthorizationCode = async () => {
            throw new Error('Mock token exchange failure');
        };

        await handlerCallback.act(req, res);

        // Verify that no user is created
        const user = await mgrUser.findUser({email: TEST_EMAIL});
        assert.ok(!user, 'User should not be created if an error occurs.');
    });
});
