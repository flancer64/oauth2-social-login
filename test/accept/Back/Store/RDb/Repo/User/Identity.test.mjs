import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbCreateFkEntities, dbDisconnect, dbReset, initConfig} from '../../../../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

// SETUP ENVIRONMENT
/** @type {Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity} */
const repoIdentity = await container.get('Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity$');
const ATTR = repoIdentity.getSchema().getAttributes();

// TEST CONSTANTS
const PROVIDER_REF = 1;
const UID = 'unique_user_id';
let USER_REF;

// Test Suite for User Identity Repository
describe('Fl64_OAuth2_Social_Back_Store_RDb_Repo_User_Identity', () => {
    before(async () => {
        await dbReset(container);
        const {user} = await dbCreateFkEntities(container);
        USER_REF = user.id;
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should create a new user identity entry', async () => {
        /** @type {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity.Dto} */
        const dto = repoIdentity.createDto();
        dto.provider_ref = PROVIDER_REF;
        dto.uid = UID;
        dto.user_ref = USER_REF;

        const {primaryKey} = await repoIdentity.createOne({dto});
        assert.ok(primaryKey, 'User Identity should be created');
        assert.strictEqual(primaryKey[ATTR.PROVIDER_REF], PROVIDER_REF, 'Provider ref should match');
        assert.strictEqual(primaryKey[ATTR.UID], UID, 'UID should match');
    });

    it('should read an existing user identity by provider_ref and user_ref', async () => {
        const {record} = await repoIdentity.readOne({
            key: {provider_ref: PROVIDER_REF, user_ref: USER_REF},
        });

        assert.ok(record, 'User Identity should exist');
        assert.strictEqual(record.provider_ref, PROVIDER_REF, 'Provider ref should match');
        assert.strictEqual(record.user_ref, USER_REF, 'USER_REF should match');
    });

    it('should list all user identities', async () => {
        const identities = await repoIdentity.readMany({});

        assert.ok(identities.records.length > 0, 'There should be at least one user identity');
    });

    it('should update an existing user identity', async () => {
        const NEW_UID = UID + '_new';

        const {updatedCount} = await repoIdentity.updateOne({
            key: {provider_ref: PROVIDER_REF, user_ref: USER_REF},
            updates: {uid: NEW_UID},
        });

        assert.strictEqual(updatedCount, 1, 'One user identity should be updated');
        const {record: updated} = await repoIdentity.readOne({
            key: {provider_ref: PROVIDER_REF, user_ref: USER_REF},
        });
        assert.strictEqual(updated.uid, NEW_UID, 'Unique ID should be updated');
    });

    it('should delete an existing user identity', async () => {
        const {deletedCount} = await repoIdentity.deleteOne({
            key: {provider_ref: PROVIDER_REF, user_ref: USER_REF},
        });

        assert.strictEqual(deletedCount, 1, 'One user identity should be deleted');
    });
});
