import { html, useEffect, useRef, useCallback, useMemo, useSelector, useDispatch, useRouter, useAbortController } from '../../imports.js';
import RoomForm from './room-form.js';
import { textRoomCreate } from '../../redux-toolkit/actions/textroom-actions.js';
import { selectRoomById } from '../../redux-toolkit/slices/textroom-slice.js';

export default function EditRoom({ roomId }) {
    console.log('EditRoom', roomId);
    const dispatch = useDispatch();
    const [ routerCtx, route ] = useRouter();
    const cancelUrl = routerCtx.previous ?? '/';
    const [ getAC, resetAC ] = useAbortController(true);

    const onSubmit = useCallback(data => {
        dispatch(textRoomCreate({ data, signal: getAC().signal })).then(action => {
            console.log('AddRoom result action', action)
        })
    }, []);

    const onCancel = useCallback(() => {
        getAC().abort();
        resetAC();
        route(cancelUrl);
    }, []);

    const actions = useMemo(() => ({ onSubmit, onCancel }), [onSubmit, onCancel]);
    const selectTheRoom = useMemo(() => (state => selectRoomById(state, roomId)), [roomId]);
    const room = useSelector(selectTheRoom);
console.log('trying to find roomId', roomId);

    if (!room) return html`
        <div class="alert alert-danger">No room #${roomId}</div>
    `;

    return html`
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/rooms">Rooms</a></li>
                <li class="breadcrumb-item active" aria-current="page">Edit room #${roomId}</li>
            </ol>
        </nav>
        <${RoomForm} mode="edit" actions=${actions} room=${room} />
    `;
}
