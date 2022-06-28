import { html, useEffect, useSelector, useDispatch } from '../imports.js';
import { textroomGetAll } from '../redux-toolkit/actions/textroom-actions.js';
import RoomsList from './rooms/rooms-list.js';

export default function Rooms() {
    const { router: { url } } = useSelector(store => store);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('Rooms.useEffect in')
        const abortController = new AbortController();
        dispatch(textroomGetAll({ signal: abortController.signal }));

        return () => {
            console.log('Rooms.useEffect out');
            abortController.abort();
        }
    }, [])


    return html`
        <h1>Rooms</h1>
        <${RoomsList} />
    `;
}
