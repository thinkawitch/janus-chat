import {
    html,
    useSelector,
    useDispatch,
    useMemo,
    useEffect,
    useLayoutEffect,
    useRef,
    useAbortController,
    shallowEqual,
    createSelector
} from '../imports.js';
import {
    textRoomGetAll,
    textRoomTestLongRequest,
} from "../redux-toolkit/actions/textroom-actions.js";

// value=useSelector() and action to change the value inside useEffect() - may lead to infinite loop

export default function Home() {
    const dispatch = useDispatch();

    return html`
        <h1>Dashboard</h1>
        <div class="dashboard">
            <div class="dash-rooms card">
                <div class="card-body">
                    <a href="/rooms/add" class="btn btn-primary">Add room</a>
                </div>
            </div>
            <div class="dash-users card">
                <div class="card-body">
                    Some text<br />
                    Some text<br />
                    Some text<br />
                    Some text<br />
                    Some text<br />
                    Some text<br />
                    Some text<br />
                </div>
            </div>
        </div>
    `;
}
