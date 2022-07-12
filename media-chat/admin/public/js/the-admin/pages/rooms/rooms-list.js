import {html, useEffect, useSelector, useDispatch, useCallback} from '../../imports.js';
import { selectTextRoom } from '../../redux-toolkit/slices/textroom-slice.js';
import { useDialogConfirm, useDialogAlert } from '../../components/andrew-preact-dialog/dialog-hook.js';

const check = html`<svg class="bi" width="16" height="16"><use xlink:href="#bi-check"></use></svg>`;

export default function RoomsList() {
    const { loading, rooms, notInitialized } = useSelector(selectTextRoom);
    const { confirm } = useDialogConfirm();
    const { alert } = useDialogAlert();
    if (notInitialized) return null;

    if (!loading && !rooms.length) return html`<p>No rooms</p>`;

    const confirmToDel = useCallback(async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        const isConfirmed = await confirm({ text: `Delete room #${roomId}?`});
        console.log('isConfirmed', isConfirmed)
    }, [confirm])

    const alertSm = useCallback(async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        const agreed = await alert({ text: `Alert #${roomId}!`});
        console.log('agreed', agreed)
    }, [alert])

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
                        <a href="/rooms/delete/${r.id}" class="btn btn-sm btn-outline-danger" rel=${r.id} onClick=${confirmToDel} data-native>del</a>
                    </td>
                </tr>
            `)}
            </tbody>
        </table>
    `;
}
