import { html, useSelector, useDispatch, useEffect } from '../imports.js';

export default function Users() {

    useEffect(() => {
        console.log('Users.useEffect in')
        return () => {
            console.log('Users.useEffect out')
        }
    });

    return html`
        <h1>Users</h1>
    `;
}
