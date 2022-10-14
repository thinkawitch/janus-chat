import { html, render, Provider, useSelector, useDispatch, useCallback, useEffect } from './imports.js';
import { store } from './redux-toolkit/configure-store.js';
import Main from './components/main.js';
import JanusStatus from './components/janus-status.js';
import { startJanus, joinTextRoom } from './janus-api/janus-api.js';
import { startExternalApi } from './external-api.js';
import { selectJanus, setTextRoomPinValue } from './redux-toolkit/slices/janus-slice.js';
import { setUser } from './redux-toolkit/slices/user-slice.js';
import { addUser } from './redux-toolkit/slices/users-slice.js';
import { selectTextRoom, setRoomId } from './redux-toolkit/slices/text-room-slice.js';


export function renderApp(node, { roomId, user }) {
    store.dispatch(setUser(user)); // set me
    store.dispatch(addUser(user)); // add me to participants
    store.dispatch(setRoomId(roomId));
    startJanus(store);
    const externalApi = startExternalApi(store);
    //console.log('ea1', externalApi);
    node.innerHTML = ''; // clear the place
    render(html`
        <${Provider} store=${store}>
            <${App} />
        </Provider>
    `, node);
    return externalApi;
}


function App() {
    const {
        connecting, connectTryNumber, connected, connectFailed, disconnected,
        newCleanConnect, restoringConnect,
        errors,
        textRoomJoining, textRoomJoined, textRoomFailed,
        textRoomPinRequired, textRoomPinValue, textRoomPinIncorrect, textRoomJoiningWithPin,
    } = useSelector(selectJanus);

    const { roomId } = useSelector(selectTextRoom);

    let mainPanel = null;

    if ((!textRoomFailed && disconnected) || restoringConnect) {
        // (!textRoomFailed && disconnected) - to display final error when the initial first connect is failed
        // quick reconnect and new clean connect
        let disconnectedOverlay;
        let pinOverlay;
        let disLabel = 'Disconnected';
        let disSpinner = false;

        if (connecting) {
            disLabel = `Reconnecting, try #${connectTryNumber}`;
            disSpinner = true;
        }
        if (connectFailed) {
            disLabel = 'Reconnect failed!';
            disSpinner = false;
        }
        if (connected) {
            disLabel = `Connected`;
            disSpinner = true; // next attaching&&joining
        }
        if (textRoomJoining) {
            disLabel = `Joining room`;
            disSpinner = true;
            // the pin was entered before
            // todo, when pin was NOT ENTERED before
            /*if (textRoomPinRequired && !textRoomPinValue && !textRoomJoiningWithPin) {
                pinOverlay = PinRequired({ pinIncorrect: textRoomPinIncorrect });
            }*/
        } else if (textRoomFailed) {
            disLabel = `Failed to join room #${roomId}!`;
            disSpinner = false;
        }

        if (textRoomJoined) {
            disconnectedOverlay = null;
            //pinOverlay = null;
        } else {
            // overlay shows until reconnect successful
            disconnectedOverlay = html`
                <div class="position-absolute w-100 h-100 bg-dark" style="z-index:20;left:0;top:0;opacity:0.6">
                    <div class="d-flex flex-row d-flex justify-content-center h-100">
                        <div class="d-flex align-items-center text-light">
                            <span>${disLabel}</span>
                            ${disSpinner && html`<div className="spinner-border ms-2" role="status" aria-hidden="true"></div>`}
                        </div>
                    </div>
                </div>
            `;
        }

        mainPanel = html`
            <${Main} />
            ${disconnectedOverlay}
        `;

    } else {
        // first connection
        const earlyStart = !connecting && !connected && !connectFailed && !disconnected;
        if (earlyStart) {
            mainPanel = Connecting({ label: 'Initializing...' });
        }
        if (connecting)  {
            const connectingLabel = connectTryNumber > 1 ? `Connecting, try #${connectTryNumber}` : 'Connecting...';
            mainPanel = Connecting({ label: connectingLabel });
        }
        if (connectFailed) {
            mainPanel = BlockForFailed({ title: 'Connect failed!', errors });
        }
        if (connected) {
            mainPanel = Connecting({ label: 'Connected...' });
        }

        if (textRoomJoining) {
            mainPanel = Connecting({ label: 'Joining room...' });
            if (textRoomPinRequired && !textRoomJoiningWithPin) {
                mainPanel = PinRequired({ pinIncorrect: textRoomPinIncorrect });
            }
        } else if (textRoomFailed) {
            mainPanel = BlockForFailed({ title: `Failed to join room #${roomId}!`, errors });
        }

        if (textRoomJoined) {
            mainPanel = Main();
        }
    }

    return html`
        ${mainPanel}
        <${JanusStatus} />
    `;
}



function Connecting({ label }) {
    return html`
        <div class="d-flex flex-row d-flex justify-content-center h-100">
            <div class="d-flex align-items-center text-secondary">
                <span>${label}</span>
                <div class="spinner-border ms-2" role="status" aria-hidden="true"></div>
            </div>
        </div>
    `;
}


function PinRequired({ pinIncorrect }) {
    const dispatch = useDispatch();
    const onFormSubmit = useCallback(e => {
        e.preventDefault();
        const pin = e.target.pin.value;
        dispatch(setTextRoomPinValue(pin));
        joinTextRoom(); // temp crutch
    }, []);
    const message = pinIncorrect ? 'Pin incorrect, please try again' : 'Please enter room pin';
    useEffect(() => {
        const inp = document.getElementById('idRoomPin');
        inp?.focus();
    }, /*[]*/); // focus on every render
    return html`
        <div class="d-flex flex-row d-flex justify-content-center h-100">
            <div class="d-flex flex-column justify-content-center align-items-center">
                <span>${message}</span>
                <form onSubmit=${onFormSubmit} class="d-flex flex-column align-items-center mt-2">
                    <input type="password" name="pin" class="form-control" id="idRoomPin" autocomplete="off" />
                    <button type="submit" class="btn btn-primary mt-2">Submit</button>
                </form>
            </div>
        </div>
    `;
}


function BlockForFailed({ title, errors }) {
    return html`
        <div class="alert alert-danger">
            <h4 class="alert-heading">${title}!</h4>
            <p>Please try again later.</p>
            <hr />
            ${errors.map(e => html`<p class="mb-0">${e}</p>`)}
        </div>
    `;
}
