import { html, useSelector, useState, useCallback } from '../imports.js';
import { selectJanus } from '../redux-toolkit/slices/janus-slice.js';


export default function JanusStatus() {
    const {
        connecting, connected, connectFailed, disconnected,
        textRoomJoining, textRoomJoined, textRoomFailed,
        errors,
    } = useSelector(selectJanus);

    const [expanded, setExpanded] = useState(false);

    const onClick = () => {
        setExpanded(!expanded);
    }

    const c1Connecting = connecting && !disconnected;
    const c2Reconnecting = connecting && disconnected;

    let text = 'Initializing';
    let color = 'text-secondary';
    let buttonType = 'spinner';
    let buttonStatus;

    if (c1Connecting) {
        text = 'Connecting';
        color = 'text-secondary';
    } else if (c2Reconnecting) {
        text = 'Reconnecting';
        color = 'bg-danger';
    } else if (connected) {
        text = 'Connected';
        color = 'text-warning';
        if (textRoomJoining) {
            text = 'Joining room';
            color = 'text-warning';
        }
        if (textRoomJoined) {
            text = 'Joined the room';
            color = 'bg-success';
            buttonType = 'badge';
        }
        if (textRoomFailed) {
            text = 'Failed to join room';
            color = 'bg-danger';
            buttonType = 'badge';
        }
    } else if (disconnected) {
        text = 'Disconnected';
        color = 'bg-danger';
        buttonType = 'badge';
    }

    // final stop
    if (connectFailed) {
        text = 'Failed to connect';
        color = 'bg-danger';
        buttonType = 'badge';
        if (disconnected) {
            text = 'Reconnect limit reached';
        }
    }

    buttonStatus = (buttonType === 'badge')
        ? StatusBadge({ text, color })
        : StatusSpinner({ text, color});

    let errorsList = html`<li class="list-group-item">No errors</li>`;
    if (expanded && errors.length > 0) {
        errorsList = errors.map(error => html`<li class="list-group-item">${error}</li>`)
    }

    return html`
        <div class="janus-status" onClick=${onClick}>
            ${buttonStatus}
            ${expanded && html`
                <div class="position-relatives">
                    <div class="janus-status-errors">
                        <div class="card">
                            <ul class="list-group">
                                ${errorsList}
                            </ul>
                        </div>
                    </div>
                </div>
            `}
        </div>
    `;
}


function StatusBadge({ text, color}) {
    return html`
        <span class="badge ${color} p-2 rounded-circle" title=${text}>
            <span class="visually-hidden">${text}</span>
        </span>
    `
}

function StatusSpinner({ text, color }) {
    return html`
        <div class="spinner-grow spinner-grow-sm ${color}" role="status" title=${text}>
            <span class="visually-hidden">${text}</span>
        </div>
    `;
}
