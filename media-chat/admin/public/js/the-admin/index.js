import { html, render, Provider, useSelector, useDispatch, route } from './imports.js';
import { store } from './redux-toolkit/configure-store.js';
import Main from './components/main.js';
import Login from './components/login.js';
import { userIsLoggedOut } from './redux-toolkit/actions/user-actions.js';


function App() {
    /*const {
        connecting, connected, isReconnect, errors
    } = useSelector(store => store.janus);

    if (!connected && !isReconnect)  {
        if (errors.length > 0) {
            return errors.map(e => html`<div class="alert alert-danger">${e}</div>`);
        }
        return Connecting();
    }*/

    //const { data, error, isLoading } = useIsLoggedOutQuery();

    const { user } = useSelector(store => store);
    if (!user || !user.id ) {
        // save asked page and jump user to login
        // no beauty
        /*if (window.location.pathname.startsWith('/login')) {
            // already on login page
            return Login();
        } else {
            window.location.href = '/login';
        }*/


        return Login();
    }

    return Main();
}

export function renderAdmin(node) {
    store.dispatch(userIsLoggedOut());
    // store.dispatch(setUser(user));
    // store.dispatch(addUser(user));
    // store.dispatch(setRoomId(roomId));
    // startJanus(store);
    // const externalApi = startExternalApi(store);
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
