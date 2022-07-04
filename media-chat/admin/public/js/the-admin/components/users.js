import {
    html,
    useSelector,
    useDispatch,
    useMemo,
    useEffect,
    useLayoutEffect,
    useAbortController,
    shallowEqual,
    createSelector,
    Component
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

const makeSelectRoomsLoading = () => createSelector(state => state.textRoom, textRoom => textRoom.loading);

/*class Users extends Component {
    constructor(props) {
        super(props);
    }
    componentWillUnmount() {
        console.log('Users componentWillUnmount');
        //const dispatch = useDispatch();
        //dispatch(textRoomActionOff());
    }
    componentDidUnmount() {
        console.log('Users componentDidUnmount');
    }
    componentDidMount() {
        console.log('Users componentDidMount');
    }
    componentWillUpdate() {
        console.log('Users componentWillUpdate');
    }
    componentDidUpdate() {
        console.log('Users componentDidUpdate');
    }
    render() {
        return html`
            <h1>Users</h1>
        `
    }
}
export default Users;*/

export default function Users() {
    const loading = useSelector(selectRoomsLoading);
    const action1 = useSelector(selectRoomsAction1);

    const dispatch = useDispatch();
    const [ getAC, resetAC ] = useAbortController();

    useLayoutEffect(() => {
        console.log('Users_layout_in')
        getAC();
        dispatch(textRoomActionOn());
        return () => {
            console.log('Users_layout_out')
            dispatch(textRoomActionOff());
            getAC().abort();
        }
    }, []);

    return html`
        <h1>Users</h1>
    `;
}
