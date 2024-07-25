import {InputTimeoutHandler} from "renderer/presenters/handlers/InputTimeoutHandler.js";

export class InactivityPresenter {
    private _handler: InputTimeoutHandler;
    private _canBeResetGuard?: () => boolean;

    constructor(handler: InputTimeoutHandler = new InputTimeoutHandler()) {
        this._handler = handler;
    }

    init(timeoutSec: number, onTimeout: Function): void {
        this._handler.init(timeoutSec, onTimeout);
    }

    /**
     * set a guard that determines whether the inactivity timer
     * is allowed to be reset and started
     */
    setResetGuard(guard: () => boolean): void {
        this._canBeResetGuard = guard;
    }

    resetAndStart(): void {
        // Respect guard if provided; do nothing when not allowed to reset
        if (this._canBeResetGuard && !this._canBeResetGuard()) {
            return;
        }

        this._handler.resetAndStartTimeout();
    }

    stop(): void {
        this._handler.stopTimeout();
    }
}
