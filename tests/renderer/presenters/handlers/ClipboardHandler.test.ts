import {ClipboardHandler, ClipboardItemTypes} from "renderer/presenters/handlers/ClipboardHandler.js";

describe('ClipboardController ', () => {
    let clipboard: ClipboardHandler;

    beforeEach(() => {
        clipboard = new ClipboardHandler();
    });

    it('should initialize with no cut item', () => {
        expect(clipboard.getCutItem()).toBeNull();
    });

    it('should store the cut content correctly', () => {
        clipboard.cut(1, ClipboardItemTypes.Content);
        expect(clipboard.getCutItem()).toEqual({ id: 1, type: ClipboardItemTypes.Content });
    });

    it('should store the cut folder correctly', () => {
        clipboard.cut(3, ClipboardItemTypes.Folder);
        expect(clipboard.getCutItem()).toEqual({ id: 3, type: ClipboardItemTypes.Folder });
    });

    it('should detect content in clipboard by ID and type', () => {
        clipboard.cut(5, ClipboardItemTypes.Content);
        expect(clipboard.isContentInClipboard(5)).toBe(true);
        expect(clipboard.isContentInClipboard(6)).toBe(false); // wrong ID
        expect(clipboard.isFolderInClipboard(5)).toBe(false);  // wrong type
    });

    it('should detect folder in clipboard by ID and type', () => {
        clipboard.cut(10, ClipboardItemTypes.Folder);
        expect(clipboard.isFolderInClipboard(10)).toBe(true);
        expect(clipboard.isFolderInClipboard(11)).toBe(false); // wrong ID
        expect(clipboard.isContentInClipboard(10)).toBe(false); // wrong type
    });

    it('should clear the clipboard item', () => {
        clipboard.cut(99, ClipboardItemTypes.Content);
        clipboard.clear();
        expect(clipboard.getCutItem()).toBeNull();
        expect(clipboard.isContentInClipboard(99)).toBe(false);
        expect(clipboard.isFolderInClipboard(99)).toBe(false);
    });
});
