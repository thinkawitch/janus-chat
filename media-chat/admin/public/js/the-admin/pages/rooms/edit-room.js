import { html, useEffect, useLayoutEffect, useRef, useCallback, useMemo, useSelector, useDispatch, useRouter, useAbortController } from '../../imports.js';
import RoomForm from './room-form.js';
import { getRoom, updateRoom, deleteRoom } from '../../redux-toolkit/actions/rooms-actions.js';
import { selectTextRoom, selectRoomById, cleanUpdatingError } from '../../redux-toolkit/slices/rooms-slice.js';
import TopError from '../../components/top-error.js';
import { useToast } from '../../components/andrew-preact-bootstrap-toast/toast-hook.js';
import { useDialogConfirm } from '../../components/andrew-preact-dialog/dialog-hook.js';
import ButtonSpinner from '../../components/button-spinner.js';


export default function EditRoom({ roomId }) {
    const dispatch = useDispatch();
    const [ routerCtx, route ] = useRouter();
    const returnUrl = routerCtx.previous ?? '/';
    const [ getAC, resetAC ] = useAbortController(true);
    const { updatingError } = useSelector(selectTextRoom);
    const { addToast } = useToast();

    const selectTheRoom = useMemo(() => (state => selectRoomById(state, roomId)), [roomId]);
    const room = useSelector(selectTheRoom);
    const { getting, gettingError } = useSelector(selectTextRoom);

    let alwaysGetFresh = true;
    useLayoutEffect(() => {
        let promise;
        if (!room || alwaysGetFresh) {
            promise = dispatch(getRoom({ roomId }))
        }
        return () => {
            promise?.abort();
        }
    }, [roomId])

    const onSubmit = useCallback(async data => {
        const action = await dispatch(updateRoom({ roomId, data, signal: getAC().signal }));
        console.log('EditRoom result action', action)
        if (!action.error) {
            const roomId = action.meta.arg.roomId;
            addToast({ message: `Room #${roomId} updated.`});
            dispatch(getRoom({ roomId }));  // get fresh data, for correct required fields
            //route(returnUrl);
        }
    }, []);

    const onCancel = useCallback(() => {
        getAC().abort();
        resetAC();
        dispatch(cleanUpdatingError());
        route(returnUrl);
    }, []);

    const actions = useMemo(() => ({ onSubmit, onCancel }), [onSubmit, onCancel]);

    let content = null;

    if (room) {
        let notUpdated = null;
        if (updatingError) {
            notUpdated = TopError({error: updatingError});
        }
        content = html`
            ${notUpdated}
            <${RoomForm} mode="edit" actions=${actions} room=${room} />
            <${DeleteRoom} room=${room} />
        `;
    } else {
        if (getting) {
            content = html`
                <div class="d-flex align-items-center text-secondary">
                    <span>Loading room...</span>
                    <div class="spinner-border spinner-border-sm  ms-2" role="status" aria-hidden="true"></div>
                </div>
            `;
        } else if (gettingError) {
            content = TopError({error: gettingError});
        }
    }

    return html`
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/rooms">Rooms</a></li>
                <li class="breadcrumb-item active" aria-current="page">Edit room #${roomId}</li>
            </ol>
        </nav>
        ${content}
    `;
}


function DeleteRoom({ room }) {
    const { id: roomId } = room;
    const dispatch = useDispatch();
    const { confirm } = useDialogConfirm();
    const { addToast } = useToast();
    const { deleting } = useSelector(selectTextRoom);

    const confirmToDel = useCallback(async () => {
        const confirmed = await confirm({ message: `Delete room #${roomId}?`});
        if (confirmed) {
            const action = await dispatch(deleteRoom({ roomId }));
            if (!action.error) {
                addToast({ message: `Room #${roomId} deleted.` });
            }
        }
    }, [roomId])

    return html`
        <hr />
        <p class="text-muted">Delete room #${roomId}</p>
        <${ButtonSpinner} type="button" class="btn btn-danger mb-3" disabled=${deleting} onclick=${confirmToDel}>Delete<//>
    `;
}
