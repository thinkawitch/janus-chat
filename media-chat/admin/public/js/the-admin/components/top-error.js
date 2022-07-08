import { html } from '../imports.js';

export default function TopError({ error }) {
    console.log('TopError', error)
    if (!error) return null;

    if (error?.status || error?.detail) {
        // symfony-like error
        return html`
            <div class="alert alert-danger">${error?.detail ? error.detail : error?.title}</div>
        `
    }
    if (error instanceof Error) {
        // js error
        return html`
            <div class="alert alert-danger">${error.message}</div>
        `
    }
}
