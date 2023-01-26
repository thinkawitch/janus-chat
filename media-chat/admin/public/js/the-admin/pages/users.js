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
    selectRoomsLoading,
} from '../redux-toolkit/slices/rooms-slice.js';



export default function Users() {
    const loading = useSelector(selectRoomsLoading);
    const dispatch = useDispatch();
    const [ getAC, resetAC ] = useAbortController();
    useSmallTitle('Users');

    return html`
        <h1 class="d-none d-lg-block">Users</h1>
    `;
}
