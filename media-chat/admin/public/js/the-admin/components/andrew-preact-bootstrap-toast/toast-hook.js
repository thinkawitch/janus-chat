import { useContext } from '../../imports.js';
import { ToastContext, TOAST_ADD, TOAST_REMOVE } from './toast-context.js';

// https://stackoverflow.com/a/67643666/1065945
const idCreator = function* () {
    let i = 1;
    while (true) yield i++;
};
const idsGenerator = idCreator();
const generateId = () => idsGenerator.next().value;

export function useToast() {
    const { dispatch } = useContext(ToastContext);
    const toastId = generateId();

    const removeToast = () => {
        dispatch({
            type: TOAST_REMOVE,
            payload: { toastId }
        });
    }

    const addToast = ({ icon, title, titleNotice, message, delay, type }) => {
        dispatch({
            type: TOAST_ADD,
            payload: { toastId, removeToast, icon, title, titleNotice, message, delay, type }
        });
    }

    return { addToast, removeToast, toastId }
}
