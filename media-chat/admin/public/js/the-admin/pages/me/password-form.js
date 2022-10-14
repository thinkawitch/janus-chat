import { html, useEffect, useSelector, useDispatch, useCallback, useState, useRef } from '../../imports.js';
import ButtonSpinner from '../../components/button-spinner.js';
import { userUpdatePassword } from '../../redux-toolkit/actions/user-actions.js';
import { selectUser } from '../../redux-toolkit/slices/user-slice.js';
import { useToast } from '../../components/andrew-preact-bootstrap-toast/toast-hook.js';
import TopError from '../../components/top-error.js';

export default function PasswordForm() {
    const dispatch = useDispatch();
    const emptyFields = { current_password: '', new_password: '', confirm_new: '' };
    const [ fields, setFields ] = useState(emptyFields);
    //const [ someError, setSomeError ] = useState(null);
    const { addToast } = useToast();
    const { updatingPassword, updatingPasswordError } = useSelector(selectUser);

    let confNewInvalid = null;
    let someError = updatingPasswordError ?? null;
    if (fields.new_password?.length > 0 && fields.confirm_new?.length > 0 &&  fields.new_password !== fields.confirm_new) {
        //someError = new Error('Please enter correct new password confirmation.')
        confNewInvalid = 'is-invalid';
    }

    const onInput = useCallback(e => {
        const field = e.target.name;
        let val = e.target.value;
        const newFields = { ...fields, [field]: val };
        setFields(newFields);
    }, [fields]);

    const onFormSubmit = useCallback(async e => {
        e.preventDefault();
        const action = await dispatch(userUpdatePassword({ fields }));
        console.log('UpdatePassword result action', action);
        if (!action.error) {
            addToast({ type: 'info', message: 'Password changed!'});
            setFields(emptyFields); // to prevent double try
        }
    });

    return html`
        ${ someError ? TopError({'error': someError}) : null }
        <form onSubmit=${onFormSubmit}>
            <div class="row mb-3">
                <label for="upfCurrentPass" class="col-sm-3 col-form-label text-nowrap">Current password *</label>
                <div class="col-sm-9">
                    <input type="password" class="form-control" id="upfCurrentPass" name="current_password" value=${fields.current_password} onInput=${onInput} required minlength="1" />
                </div>
            </div>
            <div class="row mb-3">
                <label for="upfNewPass" class="col-sm-3 col-form-label">New password *</label>
                <div class="col-sm-9">
                    <input type="password" class="form-control" id="upfNewPass" name="new_password" value=${fields.new_password} onInput=${onInput} required minlength="1" />
                </div>
            </div>
            <div class="row mb-3">
                <label for="upfConfirmNew" class="col-sm-3 col-form-label">Confirm new *</label>
                <div class="col-sm-9">
                    <input type="password" class="form-control ${confNewInvalid}" id="upfConfirmNew" name="confirm_new" value=${fields.confirm_new} onInput=${onInput} required minlength="1" />
                </div>
            </div>
            <${ButtonSpinner} type="submit" class="btn btn-primary" disabled=${updatingPassword}>Submit<//>
        </form>
    `;
}

