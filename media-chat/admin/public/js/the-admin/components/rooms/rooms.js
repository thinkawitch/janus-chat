import { html, useEffect, useLayoutEffect, useSelector, useDispatch, useCallback, useAbortController } from '../../imports.js';
import { textRoomGetAll, textRoomTestLongRequest } from '../../redux-toolkit/actions/textroom-actions.js';
import RoomsList from './rooms-list.js';
import { selectRoomsLoading } from '../../redux-toolkit/slices/textroom-slice.js';

let rvc = 0; // room view counter
export default function Rooms() {
    console.log(`Rooms[${rvc}]`);
    //const { loading } = useSelector(store => store.textRoom); // may lead to infinite render cycle
    const loading = useSelector(selectRoomsLoading);
    //const loading = false;
    const dispatch = useDispatch();
    const canAdd = true;
    //console.log(`Rooms[${rvc}] loading`, loading)
    // double render when returning from add form with fetch in progress !?

    useLayoutEffect(() => {
        const lrvc = ++rvc;
        console.log(`Rooms[${lrvc}]_layout_in`, loading)
        let promise = null;
        /*if (!loading) */promise = dispatch(textRoomGetAll());  // crutch #1, useLayoutEffect seems fixing this problem
        //dispatch(textRoomTestLongRequest({ signal: getAC().signal }));
        return () => {
            /*if (loading) */promise?.abort(); // crutch #1
            console.log(`Rooms[${lrvc}]_layout_out`);
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
