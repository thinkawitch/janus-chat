import { html, useContext, useEffect, useRef, useState } from '../../imports.js';
import { ToastContext } from './toast-context.js';

export function Toast({ toast, onHidden }) {
    const { toastId, icon, title, timeNotice, message, delay } = toast;
    const nodeId = `idToast${toastId}`;
    useEffect(() => {
        const afterHide = () => {
            onHidden && onHidden();
            console.log('removed', toastId)
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
    const oneLiner = !icon && !title && !timeNotice;

    const nodeIcon = icon ? html`<img src="/" class="rounded me-2" alt="" />` : null;
    const nodeTimeNotice = timeNotice ? html`<small class="text-muted">${timeNotice}</small>` : null;

    const content = oneLiner
        ? html`
            <div class="d-flex bg-warning">
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
                ${nodeTimeNotice}
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;


    return html`
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" id=${`idToast${toastId}`} data-bs-delay=${bsDelay}>
            ${content}
        </div>
    `;
}



export function ToastHolder({ position }) {
    const { state } = useContext(ToastContext);
    const { toasts } = state;
    console.log('ToastHolder toasts', toasts);
    let posClasses = 'bottom-0 end-0'; // top right
    switch (position) {
        case 'top-left': posClasses = 'top-0 start-0'; break;
        case 'top-right': posClasses = 'top-0 end-0'; break;
        case 'bottom-left': posClasses = 'bottom-0 start-0'; break;
        case 'bottom-right': posClasses = 'bottom-0 end-0'; break;
    }
    return html`
        <div aria-live="polite" aria-atomic="true" class="position-static">
            <div class="toast-container position-absolute ${posClasses} p-3">
                ${toasts.map(t => html`
                    <${Toast} key=${t.toastId} toast=${t} onHidden=${t.removeToast} />
                `)}
            </div>
        </div>
    `
}
