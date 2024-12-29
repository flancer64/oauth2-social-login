import {container} from '@teqfw/test';
import assert from 'assert';

// GET OBJECTS FROM CONTAINER
/** @type {Fl64_OAuth2_Social_Shared_Dto_Provider} */
const domDto = await container.get('Fl64_OAuth2_Social_Shared_Dto_Provider$');
/** @type {Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider} */
const rdbDto = await container.get('Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider$');
/** @type {Fl64_OAuth2_Social_Back_Convert_Provider} */
const converter = await container.get('Fl64_OAuth2_Social_Back_Convert_Provider$');
/** @type {typeof Fl64_OAuth2_Social_Shared_Enum_Provider_Status} */
const STATUS = await container.get('Fl64_OAuth2_Social_Shared_Enum_Provider_Status.default');

describe('Fl64_OAuth2_Social_Back_Convert_Provider', () => {
    const sampleRdbDto = rdbDto.createDto();
    const sampleDomDto = domDto.createDto();

    beforeEach(() => {
        // Initialize RDB DTO
        sampleRdbDto.client_id = 'google-client-id';
        sampleRdbDto.client_secret = 'google-client-secret';
        sampleRdbDto.code = 'google';
        sampleRdbDto.date_created = new Date('2023-01-01T00:00:00Z');
        sampleRdbDto.id = 1;
        sampleRdbDto.name = 'Google';
        sampleRdbDto.status = STATUS.ACTIVE;

        // Initialize Domain DTO
        sampleDomDto.clientId = 'google-client-id';
        sampleDomDto.clientSecret = 'google-client-secret';
        sampleDomDto.code = 'google';
        sampleDomDto.dateCreated = new Date('2023-01-01T00:00:00Z');
        sampleDomDto.id = 1;
        sampleDomDto.name = 'Google';
        sampleDomDto.status = STATUS.ACTIVE;
    });

    it('should convert RDB DTO to Domain DTO correctly', () => {
        const domDtoConverted = converter.db2dom({dbProvider: sampleRdbDto});
        assert.deepStrictEqual(domDtoConverted, sampleDomDto, 'Converted Domain DTO should match the sample Domain DTO');
    });

    it('should convert Domain DTO to RDB DTO correctly', () => {
        const {dbProvider: rdbDtoConverted} = converter.dom2db({provider: sampleDomDto});
        assert.deepStrictEqual(rdbDtoConverted, sampleRdbDto, 'Converted RDB DTO should match the sample RDB DTO');
    });
});
