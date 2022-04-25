import { html, render, Provider, useSelector, useDispatch } from './imports.js';
import { store } from './redux-toolkit/configure-store.js';
//import Counter from './components/counter.js';
import Main from './components/main.js';
import JanusStatus from './components/janus-status.js';
import { startJanus } from './janus-api.js';
import { startExternalApi } from './external-api.js';
import { setUser } from './redux-toolkit/slices/user-slice.js';
import { addUser } from './redux-toolkit/slices/users-slice.js';
import { setRoomId } from './redux-toolkit/slices/text-room-slice.js';


function App() {
    const {
        connecting, connected, isReconnect, errors
    } = useSelector(store => store.janus);

    if (!connected && !isReconnect)  {
        if (errors.length > 0) {
            return errors.map(e => html`<div class="alert alert-danger">${e}</div>`);
        }
        return Connecting();
    }

    return html`
        <${Main} />
        <${JanusStatus} />
    `;
}


export function renderApp(node, { roomId, user }) {
    store.dispatch(setUser(user));
    store.dispatch(addUser(user));
    store.dispatch(setRoomId(roomId));
    startJanus(store);
    const externalApi = startExternalApi(store);
    //console.log('ea1', externalApi);
    render(html`
        <${Provider} store=${store}>
            <${App} />
        </Provider>
    `, node);
    return externalApi;
}


function Connecting() {
    return html`
        <div class="d-flex flex-row d-flex justify-content-center h-100">
            <div class="d-flex align-items-center text-secondary">
                <span>Connecting...</span>
                <div class="spinner-border ms-2" role="status" aria-hidden="true"></div>
            </div>
        </div>
    `;
}
