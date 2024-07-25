export class InputTimeoutHandler {

    private _timeOutId: number | null = null;
    private _callBack:Function | null = null;
    private _timeOutSec:number = 0;

    constructor() {}

    init(timeoutSec:number, onTimeout:Function):void{
        this._timeOutSec = timeoutSec;
        this._callBack = onTimeout;
    }

    stopTimeout():void{
        if(this._timeOutId){
            clearTimeout(this._timeOutId);
            this._timeOutId = null;
        }
    }

    /**
     * (re)- starts the timeout
     */
    resetAndStartTimeout():void{
        if(this._timeOutId)
            clearTimeout(this._timeOutId);

        if(this._callBack)
            this._timeOutId = setTimeout(this._callBack, this._timeOutSec * 1000);
    }
}