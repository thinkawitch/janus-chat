import { html, useEffect, useSelector, useDispatch, useCallback, useState, useRef } from '../../imports.js';
import { selectTextRoom } from '../../redux-toolkit/slices/textroom-slice.js';
import ButtonSpinner from '../../components/button-spinner.js';

export default function RoomForm(props) {
    const { mode, room, actions: { onSubmit, onCancel } } = props;
    const { creating, updating } = useSelector(selectTextRoom);
    const modeAdd = mode === 'add';
    const modeEdit = mode === 'edit';
    const pending = creating || updating;

    const initFields = {
        description: '',
        history: '',
        pin: '',
        secret: '',
    };
    if (modeEdit) {
        for (const f in initFields) initFields[f] = room[f];
    }
    const [fields, setFields] = useState(initFields); // make fields controlled to render correct values in edit mode

    useEffect(() => {
        if (modeEdit) {
            let updateFields = {};
            for (const f in initFields) updateFields[f] = room[f];
            setFields(updateFields);
        }
    }, [room])

    const onFormSubmit = useCallback(e => {
        e.preventDefault();
        const description = e.target.rfDescription.value;
        const history = e.target.rfHistory.value;
        const pin = e.target.rfPin.value;
        const secret = e.target.rfSecret.value;
        const data = { description, history, pin, secret };
        console.log('onFormSubmit data', data);
        //console.log('onFormSubmit fields', fields); // need fields in dep list
        onSubmit(data);
    }, [onSubmit])

    const onFormCancel = useCallback(e => {
        e.preventDefault();
        onCancel();
    }, [onCancel]);

    const propsPin = {};
    let requiredPin = null;
    if (modeEdit && room.pin?.length > 0) {
        propsPin.required = true;
        propsPin.minlength = '1';
        requiredPin = '*';
    }
    const propsSecret = {};
    let requiredSecret = null;
    if (modeEdit && room.secret?.length > 0) {
        propsSecret.required = true;
        propsSecret.minlength = '1';
        requiredSecret = '*';
    }

    const onInput = useCallback(e => {
        const field = e.target.name;
        let val = e.target.value;
        if (field == 'history') val = parseInt(val);
        const newFields = { ...fields, [field]: val };
        setFields(newFields);
    }, [fields]);

    useEffect(() => {
        document.getElementById('rfDescription')?.focus()
    }, [])

    return html`
        <form onSubmit=${onFormSubmit}>
            <div class="row mb-3">
                <label for="rfDescription" class="col-sm-2 col-form-label">Description *</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="rfDescription" name="description" value=${fields.description} onInput=${onInput} required minlength="1" />
                </div>
            </div>
            <div class="row mb-3">
                <label for="rfHistory" class="col-sm-2 col-form-label">History</label>
                <div class="col-sm-10">
                    <input type="number" class="form-control" id="rfHistory" name="history" min="0" max="500" value=${fields.history} onInput=${onInput} readonly=${modeEdit}/>
                    ${modeAdd && html`<small class="text-muted">You can not change it later.</small>`}
                </div>
            </div>
            <div class="row mb-3">
                <label for="rfPin" class="col-sm-2 col-form-label">Pin ${requiredPin}</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="rfPin" name="pin" value=${fields.pin} onInput=${onInput} maxlength="10" ...${propsPin} />
                </div>
            </div>
            <div class="row mb-3">
                <label for="rfSecret" class="col-sm-2 col-form-label">Secret ${requiredSecret}</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="rfSecret" name="secret" value=${fields.secret} onInput=${onInput} maxlength="16" ...${propsSecret} />
                </div>
            </div>
            <div class="row mb-3">
                <label class="text-muted">
                    New values may be set to non-empty, but can't be changed back!
                    You can set secret, change it, but can't turn it off then.
                </label>
            </div>
            <${ButtonSpinner} type="submit" class="btn btn-primary" disabled=${pending}>Submit<//>
            <button type="button" class="btn btn-secondary ms-2" onClick=${onFormCancel}>Cancel</button>
        </form>
    `;
}
