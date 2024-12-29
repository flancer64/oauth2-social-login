import {container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECT FROM CONTAINER
/** @type {Fl64_OAuth2_Social_Shared_Dto_Provider} */
const domDto = await container.get('Fl64_OAuth2_Social_Shared_Dto_Provider$');

describe('Fl64_OAuth2_Social_Shared_Dto_Provider', () => {
    const expectedProperties = [
        'clientId',
        'clientSecret',
        'code',
        'dateCreated',
        'id',
        'name',
        'status',
    ];

    it('should create a Domain DTO with only the expected properties', () => {
        const dto = new domDto.createDto();
        const dtoKeys = Object.keys(dto).sort();

        assert.deepStrictEqual(
            dtoKeys,
            expectedProperties.sort(),
            'DTO should contain only the expected properties'
        );

        expectedProperties.forEach(prop =>
            assert.strictEqual(
                dto[prop],
                undefined,
                `Property "${prop}" should initially be undefined`
            )
        );
    });
});
