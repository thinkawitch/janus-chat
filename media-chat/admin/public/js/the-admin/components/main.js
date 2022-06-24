import { html, useSelector, useDispatch, Router, route, useState, useCallback } from '../imports.js';
import Login from './login.js';
import Users from './users.js';
import Rooms from './rooms.js';


export default function Main() {

    const [ showPanel, setShowPanel ] = useState(false);

    const togglePanel = useCallback(() => {
        setShowPanel(!showPanel);
    }, [showPanel]);

    const hidePanel = useCallback(e => {
        e && e.preventDefault();
        setShowPanel(false);
    }, [setShowPanel]);

    return html`
        <ul class="nav">
            <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="/">Home</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/users">Users</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/rooms">Rooms</a>
            </li>
            <li class="nav-item ms-auto">
                <a class="nav-link" href="/logout">Logout</a>
            </li>
        </ul>
        
        <${Router}>
            <${Login} path="/login" />
            <${Users} path="/users" />
            <${Rooms} path="/rooms"/>
            <div default>
                <h1>Dashboard</h1>

                <button class="btn btn-primary" type="button" onClick=${togglePanel}>toggle panel</button>
                
                ${showPanel && html`
                    <div class="dropdown">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                                data-bs-toggle="dropdown" aria-expanded="false">
                            Dropdown button
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            <li><a class="dropdown-item" href="#">Action</a></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li><a class="dropdown-item" href="#">Something else here</a></li>
                            <li><a class="dropdown-item" href="#" onClick=${hidePanel}>Hide panel</a></li>
                        </ul>
                    </div>`
                }
                
            </div>
        </Router>
    `;
}
