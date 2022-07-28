import { html, useSelector, useDispatch, useLayoutEffect, useAbortController, useSmallTitle } from '../imports.js';
import { selectUser } from '../redux-toolkit/slices/user-slice.js';


export default function Me() {
    const me = useSelector(selectUser);
    const dispatch = useDispatch();
    const [ getAC, resetAC ] = useAbortController();
    useSmallTitle('My account');

    return html`
        <h1 class="d-none d-lg-block">My account</h1>
        <dl>
            <dt class="text-muted">id</dt>
            <dd>${me.id}</dd>
            <dt class="text-muted">Username (email)</dt>
            <dd>${me.username}</dd>
        </dl>
    `;
}
