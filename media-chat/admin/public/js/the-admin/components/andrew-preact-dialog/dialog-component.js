import { html, useEffect, useLayoutEffect, useRef, useState } from '../../imports.js';
import { useDialogConfirm, useDialogAlert, useDialogPrompt } from './dialog-hook.js';


export function DialogConfirm() {
    const { onConfirm, onCancel, dialogState } = useDialogConfirm();
    const { show, message } = dialogState;
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
            <p>${message}</p>
            <form method="dialog">
                <button class="btn btn-primary me-3" onClick=${onConfirm}>OK</button>
                <button class="btn btn-secondary" onClick=${onCancel} autofocus>Cancel</button>
            </form>
        </dialog>
    `;
}

export function DialogAlert() {
    const { onConfirm, onCancel, dialogState } = useDialogAlert();
    const { show, message } = dialogState;
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
            <p>${message}</p>
            <form method="dialog">
                <button class="btn btn-primary" onClick=${onConfirm}>OK</button>
            </form>
        </dialog> 
    `;
}

export function DialogPrompt() {
    const { onConfirm, onCancel, dialogState } = useDialogPrompt();
    const { show, message, promptValue } = dialogState;
    const [ val, setVal ] = useState(promptValue);
    const ref = useRef(null);

    useLayoutEffect(() => {
        // update state on escape press
        ref.current?.addEventListener('cancel', e => {
            console.log('DialogPrompt_cancel')
            //onCancel();
            localOnCancel();
        })
        /*ref.current?.addEventListener('close', e => {
            console.log('DialogPrompt_close e', e)
            onCancel();
        })*/

    }, [])

    useEffect(() => {
        if (show) {
            setVal(promptValue); // set default value
            ref.current?.showModal();
        }
    }, [show])

    const onInput = e => {
        //console.log('onInput e', e)
        // do not work in modal
        /*if (e.key === 'Enter') {
            console.log('Enter')
            e.preventDefault();
            e.stopPropagation();
            onConfirm(val)
            return false;
        }*/
        setVal(e.target.value);
    }

    const localOnCancel = e => {
        setVal('');
        onCancel();
    }

    const localOnForm = (e) => {
        console.log('localOnForm')
        e.preventDefault();
        //ref.current?.close();

        //onConfirm(e.target['input_text']?.value);
        onConfirm(val);
    }
    const localOnOk = e => {
        console.log('localOnOk')
        //onConfirm(e.target.form?.['input_text']?.value)
        setVal('');
        onConfirm(val)
    }


    return html`
        <dialog ref=${ref}>
            <p>${message}</p>
            <form method="dialog" onSubmit2=${localOnForm}>
                <input type="text" class="form-control mb-3" value=${val} name="input_text" onInput=${onInput} />
                <!-- first should be ok button to submit form while enter pressed in text field -->
                <button class="btn btn-primary me-3" onClick=${localOnOk}>OK</button>
                <button class="btn btn-secondary" onClick=${localOnCancel}>Cancel</button>
            </form>
        </dialog>
    `;
}
