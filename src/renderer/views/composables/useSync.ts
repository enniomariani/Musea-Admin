import {nextTick, Ref} from 'vue';
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {SyncEvent, SyncScope} from "musea-client/renderer";

type Translator = (key: string, ...args: any[]) => string;

export function useSync()
{
    async function sync(mediaStationPresenter: MediaStationPresenter, mediaStationId: number,
                               infoTextRef: Ref<string>, t: Translator): Promise<boolean> {

        //this is important to prevent syncing when the controller was not reachable before
        //without this: the user goes into admin-screen, app cannot download contents.json because controller is not online
        //controller gets online, user clicks on exit -> app synchronises -> means loads empty contents to the controller and overwrites
        //all existing contents -> very important code here!
        if (await mediaStationPresenter.wasLastSyncSuccessful(mediaStationId)) {
            infoTextRef.value += t('nothingToSync');
            await nextTick();
            return true;
        }

        infoTextRef.value += t('startSync');
        await nextTick();
        return await mediaStationPresenter.sync(mediaStationId, (evt: SyncEvent) => _onSyncStep(evt, infoTextRef, t));
    }

    function _onSyncStep(event: SyncEvent, infoTextRef: Ref<string>, t: Translator) {
        switch (event.scope) {
            case SyncScope.MediaPlayer:
                _checkMediaPlayerSyncStep(event, infoTextRef, t);
                break;
            case SyncScope.Controller:
                if (event.type === "Connecting")
                    infoTextRef.value += t('connectToController');
                else if (event.type === "SendingContents")
                    infoTextRef.value += t('sendContentsJSON');
                else if (event.type === "Sent")
                    infoTextRef.value += t('contentsJSONsent');
                break;
            case SyncScope.MediaStation:
                if (event.type === "Done")
                    infoTextRef.value += t('syncFinished');
                break;
        }
    }

    function _checkMediaPlayerSyncStep(event: SyncEvent, infoTextRef: Ref<string>, t: Translator): void {
        if (event.type !== "MediaSendingProgress")
            infoTextRef.value += "\n";

        switch (event.type) {
            case "Connecting":
                infoTextRef.value += t('mediaPlayerConnectingWith') + event.ip + "/" + event.appName;
                break;
            case "ConnectionStatus":
                infoTextRef.value += t('mediaPlayerConnectionStatus') + event.status;
                break;
            case "LoadMediaStart":
                infoTextRef.value += t('mediaPlayerLoadMedia') + event.ext;
                break;
            case "MediaSendStart":
                infoTextRef.value += t('mediaPlayerSendMedia');
                break;
            case "MediaSendingProgress":
                infoTextRef.value += event.progressPoint;
                break;
            case "MediaSendSuccess":
                infoTextRef.value += t('mediaPlayerSendMediaSuccess');
                break;
            case "MediaSendFailed":
                infoTextRef.value += t('mediaPlayerSendMediaFailed');
                break;
            case "DeleteStart":
                infoTextRef.value += t('mediaPlayerDeleteMedia') + event.id;
                break;
        }
    }

    return {sync}
}