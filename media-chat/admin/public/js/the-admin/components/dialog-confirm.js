import {createContext, useContext, useReducer, html, useEffect} from '../imports.js';
import { DialogConfirmContext, SHOW_CONFIRM, HIDE_CONFIRM } from './dialog-confirm-context.js';

let theResolve;
export function useDialogConfirm() {
    const [ confirmState, dispatch ] = useContext(DialogConfirmContext);

    const closeConfirm = () => {
        dispatch({ type: HIDE_CONFIRM });
    };
    const onConfirm = () => {
        closeConfirm();
        theResolve(true);
    }
    const onCancel = () => {
        closeConfirm();
        theResolve(false);
    }
    const confirm = ({ text }) => {
        dispatch({
            type: SHOW_CONFIRM,
            payload: {
                text
            }
        });
        return new Promise((resolve, reject) => {
            theResolve = resolve;
            console.log('theResolve', theResolve)
        })
    }
    return { confirm, onConfirm, onCancel, confirmState };
}

export function DialogConfirm() {
    const { onConfirm, onCancel, confirmState } = useDialogConfirm();
    console.log('DialogConfirm confirmState', confirmState);
    const { show, text } = confirmState;

    useEffect(() => {
        const d = document.getElementById('idDialogConfirm');
        if (show) {

            d && d.showModal();
        }
        return () => {
            d && d.close();
        }
    }, [show])

    if (!show) return null;

    return html`
        
            <dialog id="idDialogConfirm">
                <p>${text}</p>
                <!--<form method="dialog">-->
                    <button class="btn btn-secondary me-2" onClick=${onCancel}>Cancel</button>
                    <button class="btn btn-danger" onClick=${onConfirm}>OK</button>
                <!--</form>-->
            </dialog> 
    `;
}

