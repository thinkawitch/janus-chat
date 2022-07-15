import {
    html,
    useSelector,
    useDispatch,
    useMemo,
    useEffect,
    useLayoutEffect,
    useAbortController,
    createSelector,
    useSmallTitle,
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
    useSmallTitle('Users');

    return html`
        <h1 class="d-none d-lg-block">Users</h1>
    `;
}
