import { html, useSelector, useDispatch, useMemo, useSmallTitle, useCallback, useLayoutEffect } from '../imports.js';
import { getRoomsStats } from '../redux-toolkit/actions/rooms-actions.js';
import ButtonSpinner from '../components/button-spinner.js';
import { selectRoomsStats } from '../redux-toolkit/slices/rooms-slice.js';

// value=useSelector() and action to change the value inside useEffect() - may lead to infinite loop

export default function Home() {
    const dispatch = useDispatch();
    useSmallTitle('Home');
    const { loading, totalRooms, enabledRooms, activeRooms, deletedRooms } = useSelector(selectRoomsStats);

    useLayoutEffect(() => {
        const promise = dispatch(getRoomsStats());
        return () => {
            promise.abort();
            console.log(`Home_layout_out`);
        }
    }, [])

    const refreshRooms = useCallback(() => {
        dispatch(getRoomsStats());
    }, [])

    return html`
        <div class="d-flex flex-row flex-wrap align-items-center gap-2 mb-3 mb-lg-0">
            <h1 class="d-none d-lg-block">Home</h1>
            <${ButtonSpinner} class="btn btn-secondary btn-sm" onClick=${refreshRooms} disabled=${loading}>refresh<//>
        </div>
        
        <div class="dashboard">
            <div class="dash-rooms card">
                <div class="card-body">
                    <div class="mb-2">
                        <h5 class="card-title">Rooms</h5>
                        total: <span class="fw-bold me-2">${totalRooms}</span>
                        <br/>
                        enabled: <span class="fw-bold me-2">${enabledRooms}</span>
                        <small>(allowed to start)</small>
                        <br/>
                        active: <span class="fw-bold me-2">${activeRooms}</span>
                        <small>(currently running)</small>
                    </div>
                    <a href="/rooms/add" class="btn btn-primary">Add room</a>
                    <hr />
                    deleted rooms: <span class="fw-bold">${deletedRooms}</span>
                </div>
            </div>
            <div class="dash-users card">
                <div class="card-body">
                    <h5 class="card-title">Users</h5>
                </div>
            </div>
        </div>
    `;
}
