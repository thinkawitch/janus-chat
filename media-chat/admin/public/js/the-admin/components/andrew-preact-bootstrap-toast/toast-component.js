import { html, useContext, useEffect } from '../../imports.js';
import { ToastContext } from './toast-context.js';


export function Toast({ toast, onHidden }) {
    const { toastId, icon, title, titleNotice, message, delay, type } = toast;
    const nodeId = `idToast${toastId}`;

    useEffect(() => {
        const afterHide = () => {
            onHidden && onHidden();
        }
        const node = document.getElementById(nodeId);
        if (node) {
            bootstrap.Toast.getOrCreateInstance(node).show();
            node.addEventListener('hidden.bs.toast', afterHide)
        }
        return () => {
            if (node) {
                node.removeEventListener('hidden.bs.toast', afterHide)
            }
        }
    }, [])

    const bsDelay = delay || 5000;
    const oneLiner = !icon && !title && !titleNotice;

    const nodeIcon = icon ? html`<i class="bi ${icon} me-1"></i>` : null;
    const nodeNotice = titleNotice ? html`<small class="text-muted">${titleNotice}</small>` : null;

    const content = oneLiner
        ? html`
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `
        : html`
            <div class="toast-header">
                ${nodeIcon}
                <strong class="me-auto">${title}</strong>
                ${nodeNotice}
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

    const toastClass = type ? 'bg-'+type : '';  // bg-primary bg-warning etc
    return html`
        <div class="toast ${toastClass}" role="alert" aria-live="assertive" aria-atomic="true" id=${nodeId} data-bs-delay=${bsDelay}>
            ${content}
        </div>
    `;
}


export function ToastHolder({ position }) {
    const { state: { toasts } } = useContext(ToastContext);
    let posClasses = 'bottom-0 end-0'; // top right
    switch (position) {
        case 'top-left': posClasses = 'top-0 start-0'; break;
        case 'top-center': posClasses = 'top-0 start-50 translate-middle-x'; break;
        case 'top-right': posClasses = 'top-0 end-0'; break;
        case 'bottom-left': posClasses = 'bottom-0 start-0'; break;
        case 'bottom-center': posClasses = 'bottom-0 start-50 translate-middle-x'; break;
        case 'bottom-right': posClasses = 'bottom-0 end-0'; break;
    }
    return html`
        <div aria-live="polite" aria-atomic="true" class="position-relative">
            <div class="toast-container position-fixed ${posClasses} p-3">
                ${toasts.map(t => html`
                    <${Toast} key=${t.toastId} toast=${t} onHidden=${t.removeToast} />
                `)}
            </div>
        </div>
    `;
}
