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
    createSelector,
    useSmallTitle,
} from '../imports.js';
import {
    textRoomGetAll,
    textRoomTestLongRequest,
} from "../redux-toolkit/actions/textroom-actions.js";
import {useToast} from "../components/andrew-preact-bootstrap-toast/toast-hook.js";

// value=useSelector() and action to change the value inside useEffect() - may lead to infinite loop

export default function Home() {
    const dispatch = useDispatch();
    useSmallTitle('Home');

    const { addToast, removeToast, toastId } = useToast();
    console.log('Home toastId', toastId)

    const showToast1 = () => {
        addToast({ message: 'How are you?' })
    }

    const showToast2 = () => {
        addToast({ title: 'Wow', message: 'Wait for 20 secs', delay: 20000 })
        window.removeToast = removeToast; //test removal before timer expires
    }

    const showToast3 = () => {
        addToast({ title: 'Warning', timeNotice: '10 mins left', message: 'Think about it', delay: 10000 })
    }

    return html`
        <h1 class="d-none d-lg-block">Home</h1>
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
        <div class="mt-3">
            <button class="btn btn-info" onClick=${showToast1}>Toast 1</button>
            <button class="btn btn-info ms-2" onClick=${showToast2}>Toast 2</button>
            <button class="btn btn-info ms-2" onClick=${showToast3}>Toast 3</button>
        </div>
    `;
}
