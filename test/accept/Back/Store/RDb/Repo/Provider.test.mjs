import assert from 'assert';
import {createContainer} from '@teqfw/test';
import {dbConnect, dbCreateFkEntities, dbDisconnect, dbReset, initConfig} from '../../../../common.mjs';

// SETUP CONTAINER
const container = await createContainer();
await initConfig(container);

// SETUP ENVIRONMENT
/** @type {Fl64_OAuth2_Social_Back_Store_RDb_Repo_Provider} */
const repoProvider = await container.get('Fl64_OAuth2_Social_Back_Store_RDb_Repo_Provider$');
/** @type {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Status} */
const STATUS = await container.get('Fl64_OAuth2_Social_Shared_Enum_Provider_Status.default');

const ATTR = repoProvider.getSchema().getAttributes();

// TEST CONSTANTS
let PROVIDER_ID;
const PROVIDER_CODE = 'google';
const PROVIDER_NAME = 'Google';
const CLIENT_ID = 'client-id-example';
const CLIENT_SECRET = 'client-secret-example';

// Test Suite for Provider Repository
describe('Fl64_OAuth2_Social_Back_Store_RDb_Repo_Provider', () => {
    before(async () => {
        await dbReset(container);
        await dbCreateFkEntities(container);
        await dbConnect(container);
    });

    after(async () => {
        await dbDisconnect(container);
    });

    it('should create a new provider entry', async () => {
        /** @type {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider.Dto} */
        const dto = repoProvider.createDto();
        dto.client_id = CLIENT_ID;
        dto.client_secret = CLIENT_SECRET;
        dto.code = PROVIDER_CODE;
        dto.date_created = new Date();
        dto.name = PROVIDER_NAME;
        dto.status = STATUS.ACTIVE;

        const {primaryKey} = await repoProvider.createOne({dto});
        PROVIDER_ID = primaryKey[ATTR.ID];
        assert.ok(primaryKey, 'Provider should be created');
    });

    it('should read an existing provider by ID', async () => {
        const {record} = await repoProvider.readOne({
            key: {id: PROVIDER_ID},
            select: ['id', 'name', 'code'],
        });

        assert.ok(record, 'Provider should exist');
        assert.strictEqual(record.id, PROVIDER_ID, 'Provider ID should match');
        assert.strictEqual(record.name, PROVIDER_NAME, 'Provider name should match');
    });

    it('should list all providers', async () => {
        const providers = await repoProvider.readMany({
            conditions: {},
            sorting: {id: 'asc'},
        });

        assert.ok(providers.records.length > 0, 'There should be at least one provider');
    });

    it('should update an existing provider', async () => {
        const {record} = await repoProvider.readOne({
            key: {id: PROVIDER_ID},
        });
        record.status = STATUS.INACTIVE;

        const {updatedCount} = await repoProvider.updateOne({
            key: {id: PROVIDER_ID},
            updates: {status: record.status},
        });

        assert.strictEqual(updatedCount, 1, 'One provider should be updated');
        const {record: updatedProvider} = await repoProvider.readOne({key: {id: PROVIDER_ID}});
        assert.strictEqual(updatedProvider.status, STATUS.INACTIVE, 'Provider status should be updated');
    });

    it('should delete an existing provider', async () => {
        const result = await repoProvider.deleteOne({key: {id: PROVIDER_ID}});

        assert.strictEqual(result.deletedCount, 1, 'One provider should be deleted');
    });
});
