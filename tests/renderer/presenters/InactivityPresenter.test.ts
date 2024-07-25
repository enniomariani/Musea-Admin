import {MockInputTimeoutHandler} from "__mocks__/renderer/presenters/handlers/MockInputTimeoutHandler.js";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";

let handler: MockInputTimeoutHandler;
let presenter: InactivityPresenter;

beforeEach(() => {
    handler = new MockInputTimeoutHandler();
    presenter = new InactivityPresenter(handler as any);
});

describe('InactivityPresenter', () => {
        it('delegates init(timeoutSec, onTimeout) to handler.init', () => {
        const timeoutSec:number = 42;
        const onTimeout = jest.fn();

        presenter.init(timeoutSec, onTimeout);

        expect(handler.init).toHaveBeenCalledTimes(1);
        expect(handler.init).toHaveBeenCalledWith(timeoutSec, onTimeout);
    });

    it('delegates resetAndStart to handler.resetAndStartTimeout', () => {
        presenter.resetAndStart();
        expect(handler.resetAndStartTimeout).toHaveBeenCalledTimes(1);
    });

    it('delegates stop to handler.stopTimeout', () => {
        presenter.stop();
        expect(handler.stopTimeout).toHaveBeenCalledTimes(1);
    });
});

describe('InactivityPresenter with guard', () => {
    it('does not arm when guard returns false', () => {
        presenter.setResetGuard(() => false);
        presenter.resetAndStart();
        expect(handler.resetAndStartTimeout).not.toHaveBeenCalled();
    });

    it('arms when guard returns true', () => {
        presenter.setResetGuard(() => true);
        presenter.resetAndStart();
        expect(handler.resetAndStartTimeout).toHaveBeenCalledTimes(1);
    });

    it('stop always delegates', () => {
        presenter.setResetGuard(() => false);
        presenter.stop();
        expect(handler.stopTimeout).toHaveBeenCalledTimes(1);
    });
});
