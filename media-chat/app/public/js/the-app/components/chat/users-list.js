import { html, useRef, useEffect, useCallback, useSelector, useDispatch } from '../../imports.js';

export default function UsersList() {
    const participants = useSelector(state => state.textRoom.participants);

    return html`
        <div class="users-list">
            ${participants.map((p) => html`<${User} key=${'uk-'+p.username} user=${p}/>`)}
        </div>
    `;
}

function User({ user }) {
    const { display } = user;
    return html`
        <div class="ul-user">${display}</div>
    `;
}
