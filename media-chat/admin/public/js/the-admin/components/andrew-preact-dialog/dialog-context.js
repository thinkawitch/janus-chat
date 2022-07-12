import { createContext, useReducer, html } from '../../imports.js';


// base on https://devrecipes.net/custom-confirm-dialog-with-react-hooks-and-the-context-api/

export const DialogContext = createContext();

export const DIALOG_SHOW = 'DIALOG_SHOW';
export const DIALOG_HIDE = 'DIALOG_HIDE';

export const DIALOG_ID_CONFIRM = 1;
export const DIALOG_ID_ALERT = 2;

const oneDialogDefault = { show: false, text: '' }

const initialState = {
    /* [dialogId] => {oneDialog}  */
    [DIALOG_ID_CONFIRM]: { ...oneDialogDefault },
    [DIALOG_ID_ALERT]: { ...oneDialogDefault },
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case DIALOG_SHOW: {
            const { dialogId, text } = action.payload;
            return {
                ...state,
                [dialogId]: { show: true, text }
            };
        }
        case DIALOG_HIDE: {
            const { dialogId } = action.payload;
            return {
                ...state,
                [dialogId]: { ...oneDialogDefault }
            }
        }
        default:
            return initialState;
    }
}

export const DialogContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return html`
        <${DialogContext.Provider} value=${[state, dispatch]}>
            ${children}
        </>
    `;
};
