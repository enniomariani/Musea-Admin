export {};

declare global {
    interface Window {
        backend:IBackend;
    }

    interface IBackend {
        loadSettings():Promise<IBackendData>;
        loadTheme():Promise<any|null>;
        getResourcePath(relativePath:string):Promise<string>;
    }

    interface IBackendData {
        pathToDataFolder: string;
        json: any;
        errorsInJson: string;
    }
}