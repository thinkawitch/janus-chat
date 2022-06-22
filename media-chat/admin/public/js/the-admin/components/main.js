import { html, useSelector, useDispatch, Router, route } from '../imports.js';
import Login from './login.js';
import Users from './users.js';
import Rooms from './rooms.js';


export default function Main() {

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
            </div>
        </Router>
    `;
}
