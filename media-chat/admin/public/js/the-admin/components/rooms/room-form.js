import { html, useEffect, useSelector, useDispatch, useCallback } from '../../imports.js';

export default function RoomForm(props) {
    const { mode, actions: { onSubmit, onCancel } } = props;
    const { creating, updating } = useSelector(store => store.textRoom);
    const modeAdd = mode === 'add';
    const modeEdit = mode === 'edit';
    const pending = creating || updating;

    const onFormSubmit = useCallback(e => {
        e.preventDefault();
        const description = e.target.rfDescription.value;
        const history = e.target.rfHistory.value;
        const pin = e.target.rfPin.value;
        const secret = e.target.rfSecret.value;
        const data = { description, history, pin, secret };
        console.log('onFormSubmit', data);
        onSubmit(data);
    }, [onSubmit])

    const onFormCancel = useCallback(e => {
        e.preventDefault();
        onCancel();
    }, [onCancel]);

    return html`
        <form onSubmit=${onFormSubmit}>
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
            <button type="submit" class="btn btn-primary" disabled=${pending}>
                ${pending ? html`<span class="spinner-grow spinner-grow-sm me-2" role="status" aria-hidden="true"></span>`: ''}
                Submit
            </button>
            <button type="button" class="btn btn-secondary ms-2" onClick=${onFormCancel}>Cancel</button>
        </form>
    `;
}
