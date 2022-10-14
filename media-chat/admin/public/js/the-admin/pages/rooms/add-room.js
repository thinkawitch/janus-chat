import { html, useCallback, useMemo, useDispatch, useRouter, useAbortController, useSelector } from '../../imports.js';
import RoomForm from './room-form.js';
import { textRoomCreate } from '../../redux-toolkit/actions/textroom-actions.js';
import { cleanCreatingError, selectTextRoom } from '../../redux-toolkit/slices/textroom-slice.js';
import TopError from '../../components/top-error.js';
import { useToast } from '../../components/andrew-preact-bootstrap-toast/toast-hook.js';

export default function AddRoom() {
    const dispatch = useDispatch();
    const [ routerCtx, route ] = useRouter();
    const returnUrl = routerCtx.previous ?? '/';
    const [ getAC, resetAC ] = useAbortController(true);
    const { creatingError } = useSelector(selectTextRoom);
    const { addToast } = useToast();

    const onSubmit = useCallback(async data => {
        const action = await dispatch(textRoomCreate({ data, signal: getAC().signal }));
        console.log('AddRoom result action', action);
        if (!action.error) {
            const roomId = action.payload.room;
            addToast({ message: `Room #${roomId} created.`});
            route('/rooms');
        }
    }, []);

    const onCancel = useCallback(() => {
        getAC().abort();
        resetAC();
        dispatch(cleanCreatingError());
        route(returnUrl);
    }, []);

    const actions = useMemo(() => ({ onSubmit, onCancel }), [onSubmit, onCancel]);

    return html`
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/rooms">Rooms</a></li>
                <li class="breadcrumb-item active" aria-current="page">Add room</li>
            </ol>
        </nav>
        ${ creatingError ? TopError({'error': creatingError}) : null }
        <${RoomForm} mode="add" actions=${actions} />
    `;
}
