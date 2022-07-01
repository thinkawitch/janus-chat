import {
    html,
    useSelector,
    useDispatch,
    useMemo,
    useEffect,
    useAbortController,
    shallowEqual,
    createSelector
} from '../imports.js';
import {
    textRoomGetAll,
    textRoomTestLongRequest,
    textRoomActionOn,
    textRoomActionOff,
} from "../redux-toolkit/actions/textroom-actions.js";
import {
    selectRoomsLoading,
} from "../redux-toolkit/slices/textroom-slice.js";

const makeSelectRoomsLoading = () => createSelector(state => state.textRoom, textRoom => textRoom.loading);

export default function Users() {
    console.log('Users')
    //const { loading } = useSelector(store => store.textRoom); // do cycle useEffect in/out !
    //const { loading } = useSelector(store => store.textRoom, shallowEqual); // no difference
    //const { action1 } = useSelector(store => store.textRoom); // do rerender !
    const loading = useSelector(selectRoomsLoading); //in/out no cycle
    //const selectRoomsLoadingMemo = useMemo(makeSelectRoomsLoading, []);
    //const loading = useSelector(selectRoomsLoadingMemo);

    const dispatch = useDispatch();
    const [ getAC, resetAC ] = useAbortController(true);
    console.log('Users loading', loading)
    useEffect(() => {
        console.log('Users.useEffect in')
        getAC();
        //dispatch(textRoomTestLongRequest({ signal: getAC().signal }));
        //dispatch(textRoomGetAll({ signal: getAC().signal }));
        dispatch(textRoomActionOn());
        return () => {
            console.log('Users.useEffect out')
            dispatch(textRoomActionOff());
            getAC().abort();
        }
    }, []);

    return html`
        <h1>Users</h1>
    `;
}
