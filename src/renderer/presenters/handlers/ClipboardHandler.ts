export const ClipboardItemTypes = {
    Folder: 'folder',
    Content: 'content',
} as const;

export type ClipboardItemType = typeof ClipboardItemTypes[keyof typeof ClipboardItemTypes];

export interface IClipboardEntry {
    id: number;
    type: ClipboardItemType;
}

export class ClipboardHandler {
    private _cutItem: IClipboardEntry | null = null;

    cut(id: number, type: ClipboardItemType) {
        this._cutItem = { id, type };
    }

    isContentInClipboard(id:number): boolean {
        if (this._cutItem !== null && this._cutItem.id === id && this._cutItem.type === ClipboardItemTypes.Content)
            return true;
        else
            return false;
    }

    isFolderInClipboard(id:number): boolean {
        if (this._cutItem !== null && this._cutItem.id === id && this._cutItem.type === ClipboardItemTypes.Folder)
            return true;
        else
            return false;
    }

    getCutItem(): IClipboardEntry | null {
        return this._cutItem;
    }

    clear() {
        this._cutItem = null;
    }
}