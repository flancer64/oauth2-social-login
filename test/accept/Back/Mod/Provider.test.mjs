import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbCreateFkEntities, dbDisconnect, dbReset, initConfig} from '../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

// SETUP ENVIRONMENT
/** @type {Fl64_OAuth2_Social_Back_Mod_Provider} */
const modProvider = await container.get('Fl64_OAuth2_Social_Back_Mod_Provider$');

let PROVIDER_ID;

const CLIENT_ID = 'google-client-id';
const CLIENT_ID_UPDATED = 'google-client-id-updated';
const CODE = 'google';
const CODE_UPDATED = 'google-updated';

// Test Suite for OAuth2 Login Provider Model
describe('Fl64_OAuth2_Social_Back_Mod_Provider', () => {

    before(async () => {
        await dbReset(container);
        const {provider} = await dbCreateFkEntities(container);
        PROVIDER_ID = provider.id;
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should successfully create a new provider entry', async () => {
        const dto = modProvider.composeEntity();
        dto.clientId = CLIENT_ID;
        dto.clientSecret = 'google-client-secret';
        dto.code = CODE;
        dto.name = 'Google';
        dto.status = 'active';

        const newProvider = await modProvider.create({dto});

        // Check if the provider entry was created
        assert.ok(newProvider, 'Provider entry should exist');
        assert.strictEqual(newProvider.clientId, CLIENT_ID, 'Provider clientId should match');
    });

    it('should read an existing provider entry by provider reference', async () => {
        const foundProvider = await modProvider.read({id: PROVIDER_ID});

        // Check if the provider entry was read correctly
        assert.strictEqual(foundProvider.id, PROVIDER_ID, 'Provider ID should match');
        assert.strictEqual(foundProvider.clientId, CLIENT_ID, 'Provider clientId should match');
    });

    it('should update an existing provider entry', async () => {
        const dto = await modProvider.read({id: PROVIDER_ID});
        dto.clientId = CLIENT_ID_UPDATED;
        dto.code = CODE_UPDATED;
        const updated = await modProvider.update({dto});

        // Verify the update
        assert.strictEqual(updated.clientId, CLIENT_ID_UPDATED, 'Provider clientId should be updated');
        assert.strictEqual(updated.code, CODE_UPDATED, 'Provider code should be updated');
    });

    it('should list all provider entries', async () => {
        const providers = await modProvider.list();
        assert.strictEqual(providers.length, 1, 'The total number of providers should match the created entries.');
    });

    it('should delete an existing provider entry by provider reference', async () => {
        const dto = await modProvider.read({id: PROVIDER_ID});
        assert.ok(dto, 'Provider entry should exist before deletion');
        const total = await modProvider.delete({dto});
        assert.strictEqual(total, 1, 'One provider entry should be deleted');

        // Attempt to read deleted entry
        const removedProvider = await modProvider.read({id: PROVIDER_ID});
        assert.strictEqual(removedProvider, null, 'Provider entry should be deleted');
    });
});
