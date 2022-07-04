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
    textRoomActionOn,
    textRoomActionOff,
} from "../redux-toolkit/actions/textroom-actions.js";
import {
    selectRoomsAction1,
    selectRoomsLoading,
} from "../redux-toolkit/slices/textroom-slice.js";

// value=useSelector() and action to change the value inside useEffect() - may lead to infinite loop

export default function Home() {
    const action1 = useSelector(selectRoomsAction1); // cycle! when use effect changes the value
    const dispatch = useDispatch();

    useLayoutEffect(() => {
        console.log('Home layout_in')
        dispatch(textRoomActionOn());
        return () => {
            console.log('Home layout_out')
            dispatch(textRoomActionOff());
        }
    }, [])

    return html`
        <h1>Dashboard</h1>
    `;
}
