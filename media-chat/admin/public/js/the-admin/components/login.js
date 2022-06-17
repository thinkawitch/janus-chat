import { html, useSelector, useDispatch } from '../imports.js';

export default function Login() {

    const error = false;
    const lastUsername = '';

    return html`
        <div class="screen-sign-in h-100 d-flex flex-column align-items-center justify-content-center">
            <!--<h1>Login page</h1>-->
            <div class="form-sign-in">
                <form action="" class="text-center">
                    <span class="ico-logo mb-4 fs-1"><i class="bi bi-chat-left-text"></i></span>

                    ${error
                        ? html`<div class="alert alert-danger">error text</div>`
                        : html`<h1 class="h3 mb-3 fw-normal">Please sign in</h1>`
                    }

                    <div class="form-floating">
                        <input type="text" name="username" value=${lastUsername} class="form-control" id="username" placeholder="username" />
                        <label for="username">Username</label>
                    </div>
                    <div class="form-floating">
                        <input type="password" name="password" class="form-control" id="password" placeholder="password" />
                        <label for="password">Password</label>
                    </div>
                    <div class="checkbox mb-3">
                        <label>
                            <input type="checkbox" name="remember_me" checked /> Remember me
                        </label>
                    </div>
                    <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
                </form>
            </div>
        </div>
    `;
}
