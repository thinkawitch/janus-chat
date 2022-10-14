import { createContext, useReducer, html } from '../../imports.js';

export const ToastContext = createContext();

export const TOAST_ADD = 'pbt/TOAST_ADD';
export const TOAST_REMOVE = 'pbt/TOAST_REMOVE';

const initialState = {
    toasts: []  /* idx => { toastId, removeToast, icon, title, titleNotice, message, delay, type } */
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case TOAST_ADD: {
            const toast = action.payload;
            return {...state, toasts: [...state.toasts, toast]};
        }
        case TOAST_REMOVE: {
            const { toastId } = action.payload;
            const toasts = state.toasts.filter(t => t.toastId !== toastId);
            return { ...state, toasts };
        }
        default:
            return state;
    }
}

export const ToastContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return html`
        <${ToastContext.Provider} value=${{state, dispatch}}>
            ${children}
        <//>
    `;
};
