import { html, useEffect, useLayoutEffect, useSelector, useDispatch, useCallback, useAbortController } from '../../imports.js';
import { textRoomGetAll } from '../../redux-toolkit/actions/textroom-actions.js';
import RoomsList from './rooms-list.js';
import { selectRoomsLoading } from '../../redux-toolkit/slices/textroom-slice.js';

let rvc = 0; // room view counter
export default function Rooms() {
    console.log(`Rooms[${rvc}]`);
    const loading = useSelector(selectRoomsLoading);
    const dispatch = useDispatch();
    const mayAdd = true;
    // double render when returning from add form with fetch in progress !?

    useLayoutEffect(() => {
        const lrvc = ++rvc;
        console.log(`Rooms[${lrvc}]_layout_in`, loading)
        const promise = dispatch(textRoomGetAll());
        return () => {
            promise.abort();
            console.log(`Rooms[${lrvc}]_layout_out`);
        }
    }, [])

    const refresh = useCallback(() => {
        dispatch(textRoomGetAll());
    }, [])


    return html`
        <div class="d-flex flex-row align-items-center">
            <h1>Rooms</h1>
            ${mayAdd && html`<a href="/rooms/add" role="button" class="btn btn-sm btn-primary ms-3">add room</a>`}
            <button class="btn btn-secondary btn-sm ms-3" onClick=${refresh} disabled=${loading}>
                ${loading && html`<div class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></div>`}
                ${loading ? 'loading' : 'refresh'}
            </button>
        </div>
        <${RoomsList} />
    `;
}
// ${loading && html`<div class="spinner-border ms-3 text-secondary" off-style="width: 2rem; height: 2rem;" role="status" aria-hidden="true"></div>`}
// ${!loading && html`<button class="btn btn-secondary btn-sm ms-3" onClick=${refresh}>refresh</button>`}
