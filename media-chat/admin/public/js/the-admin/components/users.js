import {
    html,
    useSelector,
    useDispatch,
    useMemo,
    useEffect,
    useLayoutEffect,
    useAbortController,
    createSelector,
} from '../imports.js';
import {
    textRoomGetAll,
    textRoomTestLongRequest,
} from "../redux-toolkit/actions/textroom-actions.js";
import {
    selectRoomsLoading,
} from "../redux-toolkit/slices/textroom-slice.js";

const makeSelectRoomsLoading = () => createSelector(state => state.textRoom, textRoom => textRoom.loading);


export default function Users() {
    const loading = useSelector(selectRoomsLoading);

    const dispatch = useDispatch();
    const [ getAC, resetAC ] = useAbortController();

    return html`
        <h1>Users</h1>
    `;
}
