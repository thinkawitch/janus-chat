import { html, useEffect, useRef, useState } from '../../imports.js';
import { useDialogConfirm, useDialogAlert, useDialogPrompt } from './dialog-hook.js';


export function DialogConfirm() {
    const { onConfirm, onCancel, dialogState } = useDialogConfirm();
    const { show, message } = dialogState;
    const ref = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        const onDialogClose = e => {
            dialog.returnValue === 'yes' ? onConfirm() : onCancel();
            dialog.returnValue = ''; //reset for next time
        }
        dialog.addEventListener('close', onDialogClose)
        return () => {
            dialog.removeEventListener('close', onDialogClose)
        }
    }, [])

    useEffect(() => {
        if (show) ref.current?.showModal();
    }, [show])

    return html`
        <dialog ref=${ref}>
            <p>${message}</p>
            <form method="dialog">
                <button type="submit" value="yes" class="btn btn-primary me-3">OK</button>
                <button type="submit" value="no" class="btn btn-secondary" autofocus>Cancel</button>
            </form>
        </dialog>
    `;
}


export function DialogAlert() {
    const { onConfirm, dialogState } = useDialogAlert();
    const { show, message } = dialogState;
    const ref = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        const onDialogCancel = e => {
            e.preventDefault(); // force user to agree, no escape
        }
        const onDialogClose = e => {
            if (dialog.returnValue === 'yes') {
                onConfirm();
            }
            dialog.returnValue = ''; //reset for next time
        }
        dialog.addEventListener('cancel', onDialogCancel)
        dialog.addEventListener('close', onDialogClose)
        return () => {
            dialog.removeEventListener('cancel', onDialogCancel)
            dialog.removeEventListener('close', onDialogClose)
        }
    }, [])

    useEffect(() => {
        if (show) ref.current?.showModal();
    }, [show])

    return html`
        <dialog ref=${ref}>
            <p>${message}</p>
            <form method="dialog">
                <button type="submit" value="yes" class="btn btn-primary">OK</button>
            </form>
        </dialog>
    `;
}


export function DialogPrompt() {
    const { onConfirm, onCancel, dialogState } = useDialogPrompt();
    const { show, message, promptValue } = dialogState;
    const [ val, setVal ] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const dialog = ref.current;
        const onDialogCancel = e => {
            onCancel();
        }
        const onDialogClose = e => {
            if (dialog.returnValue === 'yes') {
                onConfirm(val)
            } else {
                onCancel();
            }
            dialog.returnValue = '';
        }
        dialog.addEventListener('cancel', onDialogCancel)
        dialog.addEventListener('close', onDialogClose)
        return () => {
            dialog.removeEventListener('cancel', onDialogCancel)
            dialog.removeEventListener('close', onDialogClose)
        }
    }, [val])

    useEffect(() => {
        if (show) {
            setVal(promptValue); // set default value, when dialog opens for the new prompt
            ref.current?.showModal();
        }
    }, [show])

    const onInput = e => {
        setVal(e.target.value);
    }

    return html`
        <dialog ref=${ref}>
            <p>${message}</p>
            <form method="dialog">
                <input type="text" class="form-control mb-3" value=${val} onInput=${onInput} />
                <!-- first should be ok button to submit form while enter pressed in text field -->
                <button type="submit" value="yes" class="btn btn-primary me-3">OK</button>
                <button type="submit" value="no" class="btn btn-secondary">Cancel</button>
            </form>
        </dialog>
    `;
}
