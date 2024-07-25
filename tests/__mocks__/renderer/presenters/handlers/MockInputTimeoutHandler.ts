import {InputTimeoutHandler} from "renderer/presenters/handlers/InputTimeoutHandler.js";


export class MockInputTimeoutHandler extends  InputTimeoutHandler{

    init: jest.Mock;

    stopTimeout: jest.Mock;
    resetAndStartTimeout: jest.Mock;

    constructor() {
        super();

        this.init = jest.fn();

        this.stopTimeout = jest.fn();
        this.resetAndStartTimeout = jest.fn();
    }
}