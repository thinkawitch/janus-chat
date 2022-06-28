import { html, render, Provider, useSelector, useDispatch, route } from './imports.js';
import { store } from './redux-toolkit/configure-store.js';
import Main from './components/main.js';
import Login from './components/login.js';
import { authRequired } from './redux-toolkit/actions/auth-actions.js';
import { userGetMe } from './redux-toolkit/actions/user-actions.js';
import mediaChatApi from './media-chat-api.js';


function authRequiredHandler() {
    store.dispatch(authRequired());
}

function App() {
    const { auth, user } = useSelector(store => store);
    if (!user.id) {
        if (auth.notInitialized) return Connecting();
        return Login();
    }
    return Main();
}

export function renderAdmin(node) {
    mediaChatApi.setAuthRequiredHandler(authRequiredHandler);
    // check auth
    store.dispatch(userGetMe());
    render(html`
        <${Provider} store=${store}>
            <${App} />
        </Provider>
    `, node);
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
