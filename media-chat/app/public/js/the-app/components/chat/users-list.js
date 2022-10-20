import { html, useRef, useEffect, useCallback, useSelector, useDispatch } from '../../imports.js';
import { selectTextRoom } from '../../redux-toolkit/slices/text-room-slice.js';
import {selectUsers, sortUsers} from '../../redux-toolkit/slices/users-slice.js';
import { USER_STATUS_ONLINE } from '../../constants.js';


export default function UsersList() {
    const users = useSelector(selectUsers);
    const sortedUsers = sortUsers(users);
    return html`
        <div class="users-list">
            ${sortedUsers.map(u => html`<${User} key=${'uk-'+u.username} user=${u} />`)}
        </div>
    `;
}

function User({ user }) {
    const { displayName, status } = user;
    const bgClass = status === USER_STATUS_ONLINE ? 'bg-success' : 'bg-secondary';
    return html`
        <div class="ul-user">
            <span class="name text-truncate">${displayName}</span>
            <span class="status">
                <span class="badge ${bgClass} rounded-circle p-1" title="${status}">
                    <span class="visually-hidden">${status}</span>
                </span>
            </span>
        </div>
    `;
}
