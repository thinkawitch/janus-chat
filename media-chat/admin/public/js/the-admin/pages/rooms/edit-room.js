import { html, useEffect, useLayoutEffect, useRef, useCallback, useMemo, useSelector, useDispatch, useRouter, useAbortController } from '../../imports.js';
import RoomForm from './room-form.js';
import { textRoomUpdate, textRoomGet } from '../../redux-toolkit/actions/textroom-actions.js';
import { selectTextRoom, selectRoomById } from '../../redux-toolkit/slices/textroom-slice.js';
import TopError from '../../components/top-error.js';
import { useToast } from '../../components/andrew-preact-bootstrap-toast/toast-hook.js';

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
            promise = dispatch(textRoomGet({ roomId }))
        }
        return () => {
            promise?.abort();
        }
    }, [roomId])

    const onSubmit = useCallback(async data => {
        const action = await dispatch(textRoomUpdate({ data, signal: getAC().signal }));
        console.log('EditRoom result action', action)
        if (!action.error) {
            const roomId = action.payload.meta.data.id;
            addToast({ message: `Room #${roomId} updated.`});
        }
    }, []);

    const onCancel = useCallback(() => {
        getAC().abort();
        resetAC();
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
