import { html, useEffect, useRef, useCallback, useMemo, useSelector, useDispatch, useRouter, useAbortController } from '../../imports.js';
import RoomForm from './room-form.js';
import { textRoomCreate } from '../../redux-toolkit/actions/textroom-actions.js';

export default function AddRoom() {
    const dispatch = useDispatch();
    const [ routerCtx, route ] = useRouter();
    const cancelUrl = routerCtx.previous ?? '/';
    const [ getAC, resetAC ] = useAbortController();

    const onSubmit = useCallback(data => {
        dispatch(textRoomCreate({ data, signal: getAC().signal })).then(action => {
            console.log('result action', action)
        })
    }, []);

    const onCancel = useCallback(() => {
        getAC().abort();
        resetAC();
        //route(cancelUrl);
    }, []);

    const actions = useMemo(() => ({ onSubmit, onCancel }), [onSubmit, onCancel]);

    return html`
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/rooms">Rooms</a></li>
                <li class="breadcrumb-item active" aria-current="page">Add room</li>
            </ol>
        </nav>
        <${RoomForm} mode="add" actions=${actions}/>
    `;
}
