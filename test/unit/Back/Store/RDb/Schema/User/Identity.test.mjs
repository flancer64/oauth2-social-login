import {container} from '@teqfw/test';
import assert from 'assert';

/** @type {Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity} */
const schema = await container.get('Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity$');
/** @type {Fl64_OAuth2_Social_Back_Defaults} */
const DEF = await container.get('Fl64_OAuth2_Social_Back_Defaults$');

describe('Fl64_OAuth2_Social_Back_Store_RDb_Schema_User_Identity', () => {
    const ATTR = schema.getAttributes();
    const expectedProperties = [
        'provider_ref',
        'uid',
        'user_ref',
    ];

    it('should create an RDB DTO with only the expected properties', () => {
        const dto = schema.createDto();
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

    it('should have the correct ENTITY name and primary key', () => {
        assert.equal(schema.getEntityName(), `${DEF.NAME}/fl64/oauth/social/user/identity`, 'Entity name should match the expected path');
        assert.deepStrictEqual(schema.getPrimaryKey(), [ATTR.PROVIDER_REF, ATTR.UID], 'Primary key should be set to PROVIDER_REF and UID');
    });
});
