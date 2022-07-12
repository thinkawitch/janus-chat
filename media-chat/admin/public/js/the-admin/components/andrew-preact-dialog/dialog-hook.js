import { createContext, useContext, useReducer, html, useEffect, useLayoutEffect, useRef } from '../../imports.js';
import { DialogContext, DIALOG_SHOW, DIALOG_HIDE, DIALOG_ID_CONFIRM, DIALOG_ID_ALERT } from './dialog-context.js';


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
    const onConfirm = () => {
        close();
        theResolve(true);
    }
    const onCancel = () => {
        close();
        theResolve(false);
    }
    const ask = ({ text }) => {
        dispatch({
            type: DIALOG_SHOW,
            payload: { dialogId, text }
        });
        return new Promise((resolve, reject) => {
            theResolve = resolve;
        })
    }
    return { ask, onConfirm, onCancel, dialogState };
}

export function useDialogConfirm() {
    const { ask, onConfirm, onCancel, dialogState } = useDialog(DIALOG_ID_CONFIRM);
    return { confirm: ask, onConfirm, onCancel, dialogState }
}

export function useDialogAlert() {
    const { ask, onConfirm, onCancel, dialogState } = useDialog(DIALOG_ID_ALERT);
    return { alert: ask, onConfirm, onCancel, dialogState }
}
