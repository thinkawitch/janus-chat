import { useContext } from '../../imports.js';
import {
    DialogContext,
    DIALOG_SHOW,
    DIALOG_HIDE,
    DIALOG_ID_CONFIRM,
    DIALOG_ID_ALERT,
    DIALOG_ID_PROMPT
} from './dialog-context.js';


let theResolve; // one resolver, there can be only one dialog active at the time
export function useDialog(dialogId) {
    const [ state, dispatch ] = useContext(DialogContext);
    const dialogState = state[dialogId];

    const close = () => {
        dispatch({
            type: DIALOG_HIDE,
            payload: { dialogId }
        });
    };
    const onConfirm = (value) => {
        close();
        const result = dialogId === DIALOG_ID_PROMPT ? [true, value] : true;
        theResolve(result)
    }
    const onCancel = () => {
        close();
        const result = dialogId === DIALOG_ID_PROMPT ? [false] : false;
        theResolve(result);
    }
    const open = ({ message, promptValue }) => {
        dispatch({
            type: DIALOG_SHOW,
            payload: { dialogId, message, promptValue }
        });
        return new Promise((resolve, reject) => {
            theResolve = resolve;
        })
    }
    return { open, onConfirm, onCancel, dialogState }
}

export function useDialogConfirm() {
    const { open, onConfirm, onCancel, dialogState } = useDialog(DIALOG_ID_CONFIRM);
    return { confirm: open, onConfirm, onCancel, dialogState }
}

export function useDialogAlert() {
    const { open, onConfirm, onCancel, dialogState } = useDialog(DIALOG_ID_ALERT);
    return { alert: open, onConfirm, onCancel, dialogState }
}

export function useDialogPrompt() {
    const { open, onConfirm, onCancel, dialogState } = useDialog(DIALOG_ID_PROMPT);
    return { prompt: open, onConfirm, onCancel, dialogState }
}
