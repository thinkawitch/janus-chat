import { html, useSelector, useDispatch, Router, route } from '../imports.js';
import Login from './login.js';
import Users from './users.js';
import Rooms from './rooms.js';


export default function Main() {

    return html`
        <nav>
            <a href="/users">users</a>
            <a href="/rooms">rooms</a>
        </nav>
        <${Router}>
            <${Login} path="/login" />
            <${Users} path="/users" />
            <${Rooms} path="/rooms"/>
            <div default>
                dashboard
            </div>
        </Router>
    `;
}
