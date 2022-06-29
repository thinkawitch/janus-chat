import { html, useEffect, useSelector, useDispatch } from '../../imports.js';
import { textRoomGetAll } from '../../redux-toolkit/actions/textroom-actions.js';
import RoomsList from './rooms-list.js';

export default function Rooms() {
    const { textRoom: { loading } } = useSelector(store => store);
    const dispatch = useDispatch();
    const canAdd = true;

    useEffect(() => {
        //console.log('Rooms.useEffect in', loading)
        const abortController = new AbortController();
        dispatch(textRoomGetAll({ signal: abortController.signal }));
        return () => {
            //console.log('Rooms.useEffect out');
            abortController.abort();
        }
    }, [])

    return html`
        <div class="d-flex flex-row align-items-center">
            <h1>Rooms</h1>
            ${canAdd && html`<a href="/rooms/add" role="button" class="btn btn-sm btn-primary ms-3">Add room</a>`}
            ${loading && html`<div class="spinner-border ms-3 text-secondary" off-style="width: 2rem; height: 2rem;" role="status" aria-hidden="true"></div>`}
        </div>
        <${RoomsList} />
    `;
}
