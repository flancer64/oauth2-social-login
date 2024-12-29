import {container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECTS FROM CONTAINER
/** @type {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider} */
const rdbDto = await container.get('Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider$');
/** @type {Fl64_OAuth2_Social_Back_Defaults} */
const DEF = await container.get('Fl64_OAuth2_Social_Back_Defaults$');

describe('Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider', () => {
    const ATTR = rdbDto.getAttributes();
    const expectedProperties = [
        'client_id',
        'client_secret',
        'code',
        'date_created',
        'id',
        'name',
        'status',
    ];

    it('should create an RDB DTO with only the expected properties', () => {
        const dto = rdbDto.createDto();
        const dtoKeys = Object.keys(dto).sort();

        // Verify that the DTO has only the expected properties
        assert.deepStrictEqual(dtoKeys, expectedProperties.sort(), 'DTO should contain only the expected properties');

        // Check that each property is initially undefined
        expectedProperties.forEach(prop => {
            assert.strictEqual(dto[prop], undefined, `Property ${prop} should initially be undefined`);
        });
    });

    it('ATTR should contain only the expected properties', () => {
        const attrKeys = Object.keys(ATTR).sort();
        const upperCaseExpectedProperties = expectedProperties.map(p => p.toUpperCase()).sort();

        // Check that ATTR has the expected properties in uppercase
        assert.deepStrictEqual(attrKeys, upperCaseExpectedProperties, 'ATTR should contain only the expected properties in uppercase format');

        // Verify that each uppercase property in ATTR maps correctly to its original property name
        expectedProperties.forEach(prop => {
            assert.strictEqual(ATTR[prop.toUpperCase()], prop, `ATTR.${prop.toUpperCase()} should map to ${prop}`);
        });
    });

    it('should have the correct ENTITY name and primary key', async () => {
        assert.equal(rdbDto.getEntityName(), `${DEF.NAME}/fl64/oauth/social/provider`, 'Entity name should match the expected path');
        assert.deepStrictEqual(rdbDto.getPrimaryKey(), [ATTR.ID], 'Primary key should be set to ID');
    });
});
