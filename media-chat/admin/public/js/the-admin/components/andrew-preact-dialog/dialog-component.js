import { html, useEffect, useLayoutEffect, useRef } from '../../imports.js';
import { useDialogConfirm, useDialogAlert } from './dialog-hook.js';


export function DialogConfirm() {
    const { onConfirm, onCancel, dialogState } = useDialogConfirm();
    const { show, text } = dialogState;
    const ref = useRef(null);

    useLayoutEffect(() => {
        // update state on escape press
        ref.current?.addEventListener('cancel', e => {
            onCancel();
        })
    }, [])

    useEffect(() => {
        if (show) ref.current?.showModal();
    }, [show])

    return html`
        <dialog ref=${ref}>
            <p>${text}</p>
            <form method="dialog">
                <button class="btn btn-secondary me-2" onClick=${onCancel}>Cancel</button>
                <button class="btn btn-primary" onClick=${onConfirm}>OK</button>
            </form>
        </dialog>
    `;
}

export function DialogAlert() {
    const { onConfirm, onCancel, dialogState } = useDialogAlert();
    const { show, text } = dialogState;
    const ref = useRef(null);

    useLayoutEffect(() => {
        ref.current?.addEventListener('cancel', e => {
            e.preventDefault(); // force user to agree, no escape
            //onCancel();
        })
    }, [])

    useEffect(() => {
        if (show) ref.current?.showModal();
    }, [show])

    return html`
        <dialog ref=${ref}>
            <p>${text}</p>
            <form method="dialog">
                <button class="btn btn-primary" onClick=${onConfirm}>OK</button>
            </form>
        </dialog> 
    `;
}
