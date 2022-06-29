import { html, useEffect, useSelector, useDispatch, useRouter, useCallback } from '../../imports.js';

export default function RoomForm(props) {
    const { mode } = props;
    const modeAdd = mode === 'add';
    const modeEdit = mode === 'edit';
    const [ routerCtx ] = useRouter();
    const cancelUrl = routerCtx.previous ?? '/';

    const onSubmit = useCallback(e => {
        e.preventDefault();
        console.log('onSubmit e', e);
        const description = e.target.rfDescription.value;
        const history = e.target.rfHistory.value;
        const pin = e.target.rfPin.value;
        const secret = e.target.rfSecret.value;
        console.log('description', description)
        console.log('history', history)
        console.log('pin', pin)
        console.log('secret', secret)
    }, [])

    return html`
        <form onSubmit=${onSubmit}>
            <div class="row mb-3">
                <label for="rfDescription" class="col-sm-2 col-form-label">Description</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="rfDescription" />
                </div>
            </div>
            <div class="row mb-3">
                <label for="rfHistory" class="col-sm-2 col-form-label">History</label>
                <div class="col-sm-10">
                    <input type="number" class="form-control" id="rfHistory" min="0" max="500" />
                </div>
            </div>
            <div class="row mb-3">
                <label for="rfPin" class="col-sm-2 col-form-label">Pin</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="rfPin" />
                </div>
            </div>
            <div class="row mb-3">
                <label for="rfSecret" class="col-sm-2 col-form-label">Secret</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="rfSecret" />
                </div>
            </div>
            <fieldset class="row mb-3">
                <legend class="col-form-label col-sm-2 pt-0">Radios</legend>
                <div class="col-sm-10">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios1" value="option1" checked />
                        <label class="form-check-label" for="gridRadios1">
                            First radio
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="option2" />
                        <label class="form-check-label" for="gridRadios2">
                            Second radio
                        </label>
                    </div>
                    <div class="form-check disabled">
                        <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios3" value="option3" disabled />
                        <label class="form-check-label" for="gridRadios3">
                            Third disabled radio
                        </label>
                    </div>
                </div>
            </fieldset>
            <div class="row mb-3">
                <div class="col-sm-10 offset-sm-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="gridCheck1" />
                        <label class="form-check-label" for="gridCheck1">
                            Example checkbox
                        </label>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
            <a href=${cancelUrl} role="button" class="btn btn-secondary ms-2">Cancel</a>
        </form>
    `;
}
