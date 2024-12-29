import {container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECTS FROM CONTAINER
/** @type {Fl64_OAuth2_Social_Back_Store_Mem_State} */
const memState = await container.get('Fl64_OAuth2_Social_Back_Store_Mem_State$');

describe('Fl64_OAuth2_Social_Back_Store_Mem_State', () => {
    const testKey = 'test-key';

    it('should store and retrieve a boolean value', () => {
        memState.set({key: testKey, data: true});

        const retrievedData = memState.get({key: testKey});

        // Verify that the retrieved data matches the stored data
        assert.strictEqual(retrievedData, true, 'Retrieved data should match the stored boolean value');
    });

    it('should return null for expired data', (done) => {
        const shortLivedKey = 'short-lived-key';
        memState.set({key: shortLivedKey, data: true, expiresAt: Date.now() + 50});

        // Wait for the data to expire
        setTimeout(() => {
            const expiredData = memState.get({key: shortLivedKey});
            assert.strictEqual(expiredData, null, 'Expired data should return null');
            done();
        }, 100);
    });

    it('should delete data by key', () => {
        const deleteKey = 'delete-key';
        memState.set({key: deleteKey, data: true});

        memState.delete({key: deleteKey});
        const deletedData = memState.get({key: deleteKey});

        // Verify that the data is deleted
        assert.strictEqual(deletedData, null, 'Deleted data should not be retrievable');
    });

    it('should automatically clean up expired data', (done) => {
        const cleanupKey = 'cleanup-key';
        memState.set({key: cleanupKey, data: false, expiresAt: Date.now() + 50});

        // Wait for the cleanup interval to run
        setTimeout(() => {
            const cleanedData = memState.get({key: cleanupKey});
            assert.strictEqual(cleanedData, null, 'Data should be cleaned up after expiration');
            done();
        }, 100);
    });
});
