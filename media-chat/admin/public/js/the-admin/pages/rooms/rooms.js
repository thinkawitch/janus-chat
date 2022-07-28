import {
    html,
    useEffect,
    useLayoutEffect,
    useSelector,
    useDispatch,
    useCallback,
    useAbortController,
    useSmallTitle
} from '../../imports.js';
import { textRoomGetAll } from '../../redux-toolkit/actions/textroom-actions.js';
import RoomsList from './rooms-list.js';
import { selectRoomsLoading } from '../../redux-toolkit/slices/textroom-slice.js';
import ButtonSpinner from '../../components/button-spinner.js';
import RoomsFilter from './rooms-filter.js';


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

    useSmallTitle('Rooms');

    return html`
        <div class="d-flex flex-row flex-wrap align-items-center gap-2 mb-2 mb-lg-0">
            <h1 class="d-none d-lg-block">Rooms</h1>
            ${mayAdd && html`<a href="/rooms/add" role="button" class="btn btn-sm btn-primary ">add room</a>`}
            <${ButtonSpinner} class="btn btn-secondary btn-sm" onClick=${refresh} disabled=${loading}>refresh<//>
            <${RoomsFilter} />
        </div>
        <${RoomsList} />
    `;
}
