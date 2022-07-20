import { createContext, useReducer, html } from '../../imports.js';

export const DialogContext = createContext();

export const DIALOG_SHOW = 'pd/DIALOG_SHOW';
export const DIALOG_HIDE = 'pd/DIALOG_HIDE';

export const DIALOG_ID_CONFIRM = 'id_confirm';
export const DIALOG_ID_ALERT = 'id_alert';
export const DIALOG_ID_PROMPT = 'id_prompt';

const oneDialogDefault = { show: false, message: '', promptValue: '' }

const initialState = {
    /* [dialogId] => {oneDialog}  */
    [DIALOG_ID_CONFIRM]: { ...oneDialogDefault },
    [DIALOG_ID_ALERT]: { ...oneDialogDefault },
    [DIALOG_ID_PROMPT]: { ...oneDialogDefault },
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case DIALOG_SHOW: {
            const { dialogId, message, promptValue } = action.payload;
            const newVal = { show: true, message };
            if (dialogId === DIALOG_ID_PROMPT) newVal.promptValue = promptValue || '';
            return {
                ...state,
                [dialogId]: newVal
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
            return state;
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
