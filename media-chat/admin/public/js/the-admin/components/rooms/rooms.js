import { html, useEffect, useSelector, useDispatch, useCallback, useAbortController } from '../../imports.js';
import { textRoomGetAll, textRoomTestLongRequest } from '../../redux-toolkit/actions/textroom-actions.js';
import RoomsList from './rooms-list.js';
import { selectRoomsLoading } from '../../redux-toolkit/slices/textroom-slice.js';

let rvc = 0; // room view counter
export default function Rooms() {
    console.log(`Rooms[${rvc}]`);
    //const { loading } = useSelector(store => store.textRoom);
    const loading = useSelector(selectRoomsLoading);
    //const loading = false;
    const dispatch = useDispatch();
    const canAdd = true;
    const [ getAC, resetAC ] = useAbortController(true);
    //console.log(`Rooms[${rvc}] loading`, loading)
    // double render when returning from add form with fetch in progress !?

    useEffect(() => {
        const lrvc = ++rvc;
        console.log(`Rooms[${lrvc}].useEffect in`, loading)
        //const abortController = new AbortController();
        //dispatch(textRoomGetAll({ signal: abortController.signal }));
        //dispatch(textRoomGetAll());
        dispatch(textRoomGetAll({ signal: getAC().signal }));
        //dispatch(textRoomTestLongRequest({ signal: getAC().signal }));
        return () => {
            //loading && abortController.abort();
            getAC().abort();
            console.log(`Rooms[${lrvc}].useEffect out`);
        }
    }, [])

    const refresh = useCallback(e => {
        dispatch(textRoomGetAll());
    }, [])


    return html`
        <div class="d-flex flex-row align-items-center">
            <h1>Rooms</h1>
            ${canAdd && html`<a href="/rooms/add" role="button" class="btn btn-sm btn-primary ms-3">Add room</a>`}
            ${loading && html`<div class="spinner-border ms-3 text-secondary" off-style="width: 2rem; height: 2rem;" role="status" aria-hidden="true"></div>`}
            ${!loading && html`<button class="btn btn-secondary btn-sm ms-3" onClick=${refresh}>refresh</button>`}
        </div>
        <${RoomsList} />
    `;
}
