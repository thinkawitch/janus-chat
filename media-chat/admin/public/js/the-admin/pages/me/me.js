import { html, useSelector, useDispatch, useLayoutEffect, useAbortController, useSmallTitle } from '../../imports.js';
import { selectUser } from '../../redux-toolkit/slices/user-slice.js';
import PasswordForm from './password-form.js';

export default function Me() {
    const me = useSelector(selectUser);
    const dispatch = useDispatch();
    const [ getAC, resetAC ] = useAbortController();
    useSmallTitle('My account');

    return html`
        <h1 class="d-none d-lg-block">My account</h1>
        <div>
            id: <strong>#${me.id}</strong> <br />
            username: <strong>${me.username}</strong>
        </div>
        <hr />
        <h2>Change password</h2>
        <div style="max-width: 600px">
            <${PasswordForm} />
        </div>
    `;
}
