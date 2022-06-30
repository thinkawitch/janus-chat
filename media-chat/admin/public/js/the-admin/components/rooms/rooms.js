import {html, useEffect, useSelector, useDispatch, useCallback, useAbortController } from '../../imports.js';
import { textRoomGetAll } from '../../redux-toolkit/actions/textroom-actions.js';
import RoomsList from './rooms-list.js';

export default function Rooms() {
    const { loading } = useSelector(store => store.textRoom);
    const dispatch = useDispatch();
    const canAdd = true;
    const [ getAC, resetAC ] = useAbortController();

    // double render when returning from add form with fetch in progress !?

    useEffect(() => {
        console.log('Rooms.useEffect in', loading)
        const abortController = new AbortController();
        //dispatch(textRoomGetAll({ signal: abortController.signal }));
        dispatch(textRoomGetAll({ signal: getAC().signal }));
        return () => {
            console.log('Rooms.useEffect out');
            //loading && abortController.abort();
            getAC().abort();
        }
    }, [])

    const refresh = useCallback(e => {
        dispatch(textRoomGetAll());
    })

    return html`
        <div class="d-flex flex-row align-items-center">
            <h1>Rooms</h1>
            ${canAdd && html`<a href="/rooms/add" role="button" class="btn btn-sm btn-primary ms-3">Add room</a>`}
            ${loading && html`<div class="spinner-border ms-3 text-secondary" off-style="width: 2rem; height: 2rem;" role="status" aria-hidden="true"></div>`}
            ${!loading && html`<button class="btn btn-secondary btn-sm ms-3" onClick=${refresh}>refresh</button>`}
        </div>
        <${RoomsList} />
    `;
}
