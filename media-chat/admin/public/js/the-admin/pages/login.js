import { html, useCallback, useSelector, useDispatch, useState } from '../imports.js';
import { userLogin } from '../redux-toolkit/actions/auth-actions.js';

export default function Login() {
    const { auth: { pending, rejected, error } } = useSelector(store => store);
    const dispatch = useDispatch();
    const [ formVals, setFromVals ] = useState({ username: '', password: '' })
    //console.log('Login.formVals', formVals); // after unmount and mount state is the same, strange!
    const onSubmit = useCallback(e => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        console.log('username', username, 'password', password);
        setFromVals({ username, password });
        dispatch(userLogin({ username, password }));
    }, []);

    return html`
        <div class="screen-sign-in d-flex flex-column align-items-center justify-content-center">
            <!--<h1>Login page</h1>-->
            <div class="form-sign-in">
                <form action="" class="text-center" onSubmit=${onSubmit}>
                    <!--<span class="ico-logo mb-4 fs-1"><i class="bi bi-chat-left-text"></i></span>-->
                    <div class="mb-3"><img height="32" src="/apple-touch-icon.png" /></div>

                    ${error
                        ? html`<div class="alert alert-danger">${error}</div>`
                        : html`<h1 class="h3 mb-3 fw-normal">Please sign in</h1>`
                    }

                    <div class="form-floating">
                        <input type="text" name="username" value=${formVals.username} class="form-control" id="username" placeholder="username" />
                        <label for="username">Email</label>
                    </div>
                    <div class="form-floating">
                        <input type="password" name="password" value=${formVals.password} class="form-control" id="password" placeholder="password" />
                        <label for="password">Password</label>
                    </div>
                    <!--div class="checkbox mb-3">
                        <label>
                            <input type="checkbox" name="remember_me" checked /> Remember me
                        </label>
                    </div-->
                    <button class="w-100 btn btn-lg btn-primary" type="submit" disabled=${pending}>Sign in</button>
                </form>
            </div>
        </div>
    `;
}
