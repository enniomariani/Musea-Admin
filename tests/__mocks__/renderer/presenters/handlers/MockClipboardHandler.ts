import {ClipboardHandler} from "renderer/presenters/handlers/ClipboardHandler.js";

export class MockClipboardHandler extends  ClipboardHandler{

    cut: jest.Mock;

    isContentInClipboard: jest.Mock;
    isFolderInClipboard: jest.Mock;
    getCutItem: jest.Mock;
    clear: jest.Mock;

    constructor() {
        super();

        this.cut = jest.fn();

        this.isContentInClipboard = jest.fn();
        this.isFolderInClipboard = jest.fn();
        this.getCutItem = jest.fn();
        this.clear = jest.fn();
    }
}