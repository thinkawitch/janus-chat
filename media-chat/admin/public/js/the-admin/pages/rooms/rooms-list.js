import { html, useSelector, useDispatch, useCallback } from '../../imports.js';
import { selectTextRoom } from '../../redux-toolkit/slices/textroom-slice.js';
import { useDialogConfirm } from '../../components/andrew-preact-dialog/dialog-hook.js';
import { textRoomDelete } from '../../redux-toolkit/actions/textroom-actions.js';
import { useToast } from '../../components/andrew-preact-bootstrap-toast/toast-hook.js';

const check = html`<svg class="bi" width="16" height="16"><use xlink:href="#bi-check"></use></svg>`;

export default function RoomsList() {
    const { loading, rooms, filteredRooms, notInitialized } = useSelector(selectTextRoom);
    const { confirm } = useDialogConfirm();
    const { addToast } = useToast();
    const dispatch = useDispatch();

    if (notInitialized) return null;
    if (!loading && !rooms.length) return html`<p>No rooms</p>`;

    const confirmToDel = useCallback(async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        const confirmed = await confirm({ message: `Delete room #${roomId}?`});
        if (confirmed) {
            const action = await dispatch(textRoomDelete({ roomId }));
            console.log('result action', action)
            if (!action.error) {
                addToast({ message: `Room #${roomId} deleted.` });
            }
        }
    }, [])

    return html`
        <table class="table rooms-table">
            <thead>
                <th>#</th>
                <th>creator</th>
                <th>description</th>
                <th>history</th>
                <th>private</th>
                <th>active</th>
                <th>pin</th>
                <th>secret</th>
                <th>participants</th>
                <th></th>
            </thead>
            <tbody>
            ${filteredRooms.map(r => html`
                <tr key=${r.id}>
                    <td>${r.id}</td>
                    <td>${r.user_id}</td>
                    <td>${r.description}</td>
                    <td>${r.history}</td>
                    <td>${r.is_private ? check : ''}</td>
                    <td>${r.active ? check : ''}</td>
                    <td>${r.pin ? check : ''}</td>
                    <td>${r.secret ? check : ''}</td>
                    <td>${r.num_participants}</td>
                    <td>
                        ${r.active 
                            ? html`<a href="/rooms/turn-off/${r.id}" class="btn btn-sm btn-outline-secondary me-2" title="Turn off"><svg class="bi" width="16" height="16"><use xlink:href="#bi-stop-fill"></use></svg> stop</a>` 
                            : html`<a href="/rooms/turn-on/${r.id}" class="btn btn-sm btn-outline-secondary me-2" title="Turn on"><svg class="bi" width="16" height="16"><use xlink:href="#bi-play-fill"></use></svg> activate</a>`
                        }
                        <a href="/rooms/edit/${r.id}" class="btn btn-sm btn-outline-secondary me-2">edit</a>
                        <a href="/rooms/delete/${r.id}" class="btn btn-sm btn-outline-danger" rel=${r.id} onClick=${confirmToDel} data-native>del</a>
                    </td>
                </tr>
            `)}
            </tbody>
        </table>
    `;
}
