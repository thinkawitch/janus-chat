import { html, useSelector, useState, useCallback } from '../imports.js';


export default function JanusStatus() {
    const {
        connecting, connected, isReconnect,
        textRoomJoining, textRoomJoined,
        errors, reconnectLimitReached
    } = useSelector(store => store.janus);

    const [expanded, setExpanded] = useState(false);

    const onClick = () => {
        setExpanded(!expanded);
    }

    /*const onClick = useCallback(() => {
        setExpanded(!expanded);
    }, [expanded]);*/

    let text = 'Connecting';
    let color = 'text-secondary';
    let buttonStatus = 'spinner';

    if (connected) {
        color = 'text-warning';
    }
    if (connecting && isReconnect) {
        text = 'Reconnecting';
        color = 'bg-danger';
        if (reconnectLimitReached) {
            text = 'Reconnect limit reached';
            buttonStatus = 'badge'
        }
    }
    if (textRoomJoining) {
        text = 'Joining room';
        color = 'text-warning';
    }
    if (textRoomJoined) {
        text = 'Room joined';
        color = 'bg-success';
        buttonStatus = 'badge';
    }

    buttonStatus = (buttonStatus === 'badge')
        ? statusBadge({ text, color, onClick })
        : statusSpinner({ text, color, onClick });

    let errorsList = html`<li class="list-group-item">No errors</li>`;
    if (expanded && errors.length > 0) {
        errorsList = errors.map(error => html`<li class="list-group-item">${error}</li>`)
    }

    return html`
        <div class="janus-status">
            <div class="janus-status-panel">
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
        </div>
    `;
}


function statusBadge({ text, color, onClick }) {
    return html`
        <span class="badge ${color} p-2 rounded-circle" title=${text} onClick=${onClick}>
            <span class="visually-hidden">${text}</span>
        </span>
    `
}

function statusSpinner({ text, color, onClick }) {
    return html`
        <div class="spinner-grow spinner-grow-sm ${color} mb-1" role="status" title=${text} onClick=${onClick}>
            <span class="visually-hidden">${text}</span>
        </div>
    `;
}
