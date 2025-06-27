export default class Fl64_OAuth2_Social_Back_Plugin_Stop {
    /**
     * @param {Fl64_OAuth2_Social_Back_Store_Mem_State} memState
     */
    constructor(
        {
            Fl64_OAuth2_Social_Back_Store_Mem_State$: memState,
        }
    ) {
        return function () {
            memState.cleanup();
        };
    }
}
