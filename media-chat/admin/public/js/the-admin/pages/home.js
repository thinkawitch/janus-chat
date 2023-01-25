import { html, useSelector, useDispatch, useMemo, useSmallTitle, useCallback, useLayoutEffect } from '../imports.js';
import { textRoomInfo } from '../redux-toolkit/actions/textroom-actions.js';
import ButtonSpinner from '../components/button-spinner.js';
import { selectTextRoomInfo } from '../redux-toolkit/slices/textroom-slice.js';

// value=useSelector() and action to change the value inside useEffect() - may lead to infinite loop

export default function Home() {
    const dispatch = useDispatch();
    useSmallTitle('Home');
    const { loading, totalRooms, activeRooms, deletedRooms } = useSelector(selectTextRoomInfo);

    useLayoutEffect(() => {
        const promise = dispatch(textRoomInfo());
        return () => {
            promise.abort();
            console.log(`Home_layout_out`);
        }
    }, [])

    const refreshRooms = useCallback(() => {
        dispatch(textRoomInfo());
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
                        active: <span class="fw-bold me-2">${activeRooms}</span>
                        <br/>
                        deleted: <span class="fw-bold">${deletedRooms}</span>
                    </div>
                    <a href="/rooms/add" class="btn btn-primary">Add room</a>
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
