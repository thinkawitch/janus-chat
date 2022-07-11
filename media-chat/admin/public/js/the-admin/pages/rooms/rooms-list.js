import {html, useEffect, useSelector, useDispatch, useCallback} from '../../imports.js';
import { selectRooms } from '../../redux-toolkit/slices/textroom-slice.js';
import { useDialogConfirm } from '../../components/dialog-confirm.js';

const check = html`<svg class="bi" width="16" height="16"><use xlink:href="#bi-check"></use></svg>`;

export default function RoomsList() {
    const { textRoom: { loading, rooms, notInitialized } } = useSelector(state => state);
    const { confirm, onConfirm, onCancel } = useDialogConfirm();
    if (notInitialized) return null;

    if (!loading && !rooms.length) return html`<p>No rooms</p>`;

    const askToDel = useCallback(async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        console.log('askToDel roomId', roomId);
        /*setTimeout(() => {
            console.log('settimeout')
            onCancel();
        }, 3000)*/
        const isConfirmed = await confirm({ text: 'Do it?'});

        console.log('isConfirmed', isConfirmed)
    }, [confirm])

    return html`
        <table class="table">
            <thead>
                <th>#</th>
                <th>creator</th>
                <th>description</th>
                <th>private</th>
                <th>history</th>
                <th>pin</th>
                <th>participants</th>
                <th></th>
            </thead>
            <tbody>
            ${rooms.map(r => html`
                <tr>
                    <td>${r.id}</td>
                    <td>${r.user_id}</td>
                    <td>${r.description}</td>
                    <td>${r.private ? check : ''}</td>
                    <td>${r.history}</td>
                    <td>${r.pin ? check : ''}</td>
                    <td>${r.num_participants}</td>
                    <td>
                        <a href="/rooms/edit/${r.id}" class="btn btn-sm btn-outline-secondary me-2">edit</a>
                        <a href="/rooms/delete/${r.id}" class="btn btn-sm btn-outline-danger" rel=${r.id} onClick=${askToDel} data-native>del</a>
                    </td>
                </tr>
            `)}
            </tbody>
        </table>
    `;
}
