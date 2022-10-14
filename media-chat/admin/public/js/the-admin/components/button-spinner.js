import { html } from '../imports.js';

// for form submit
// button with label replaced with spinner while disabled
export default function ButtonSpinner({ children, ...props }) {
    let buttonClass = props.class ?? '';
    let labelClass = '';
    let spinner = null;
    let spinnerClass = '';
    if (props.disabled) {
        //const { color, inverseColor } = getButtonColors(buttonClass);
        labelClass = 'invisible';
        spinnerClass = 'spinner-border-sm'
        spinner = html`
            <div class="position-absolute top-50 start-50 translate-middle">
                <div class="spinner-border ${spinnerClass}" role="status" />
            </div>
        `;
    }

    return html`
        <button class=${buttonClass} ...${props}>
            <div class="position-relative">
                <span class=${labelClass}>${children}</span>
                ${spinner}
            </div>
        </button>
    `
}

const buttonTypes = {
    'btn-primary': {
        color: 'primary',
        text: 'white',
    },
    'btn-secondary': {
        color: 'secondary',
        text: 'white',
    },
    'btn-success': {
        color: 'success',
        text: 'white',
    },
    'btn-danger': {
        color: 'danger',
        text: 'white',
    },
    'btn-warning': {
        color: 'warning',
        text: 'dark',
    },
    'btn-info': {
        color: 'info',
        text: 'dark',
    },
    'btn-light': {
        color: 'light',
        text: 'dark',
    },
    'btn-dark': {
        color: 'dark',
        text: 'white',
    },
    'btn-body': {
        color: 'body',
        text: 'dark',
    },
    'btn-white': {
        color: 'white',
        text: 'dark',
    },
    'btn-transparent': {
        color: 'transparent',
        text: 'dark',
    },
}

function getButtonColors(strClass) {
    let color = null, inverseColor = null;
    const classes = String(strClass).toLowerCase();
    for (let bt in buttonTypes) {
        if (classes.indexOf(bt) !== -1) {
            color = buttonTypes[bt].color;
            inverseColor = buttonTypes[bt].text;
            break;
        }
    }
    return { color, inverseColor }
}
