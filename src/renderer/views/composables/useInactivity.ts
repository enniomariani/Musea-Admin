import { onMounted, onUnmounted } from 'vue';
import { InactivityPresenter } from 'renderer/presenters/InactivityPresenter.js';

export function useInactivity(inactivityPresenter: InactivityPresenter) {
    function handleClickAnywhere() {
        inactivityPresenter.resetAndStart();
    }

    onMounted(() => {
        window.addEventListener("pointerdown", handleClickAnywhere, { capture: true });
    });

    onUnmounted(() => {
        window.removeEventListener("pointerdown", handleClickAnywhere);
    });

    return {
        handleClickAnywhere
    };
}