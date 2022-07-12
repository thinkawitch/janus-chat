import {html, useEffect, useSelector, useDispatch, useCallback} from '../../imports.js';
import { selectTextRoom } from '../../redux-toolkit/slices/textroom-slice.js';
import { useDialogConfirm, useDialogAlert, useDialogPrompt } from '../../components/andrew-preact-dialog/dialog-hook.js';

const check = html`<svg class="bi" width="16" height="16"><use xlink:href="#bi-check"></use></svg>`;

export default function RoomsList() {
    const { loading, rooms, notInitialized } = useSelector(selectTextRoom);
    const { confirm } = useDialogConfirm();
    const { alert } = useDialogAlert();
    const { prompt } = useDialogPrompt();
    if (notInitialized) return null;

    if (!loading && !rooms.length) return html`<p>No rooms</p>`;

    const confirmToDel = useCallback(async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        const isConfirmed = await confirm({ message: `Delete room #${roomId}?`});
        console.log('isConfirmed', isConfirmed)
    }, [confirm])

    const testAlert = useCallback(async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        const agreed = await alert({ message: `Alert #${roomId}!`});
        console.log('agreed', agreed)
    }, [alert])

    const testPrompt = useCallback(async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        const [isConfirmed, value] = await prompt({ message: 'Enter your name', promptValue: `Andrew${roomId}`});
        console.log('prompt', 'isConfirmed', isConfirmed, 'value', value)
    }, [prompt])

    const testPrompt2 = async (e) => {
        e.preventDefault();
        const roomId = e.target.rel;
        const [isConfirmed, value] = await prompt({ message: 'Enter your name', promptValue: `Andrew${roomId}`});
        console.log('prompt', 'isConfirmed', isConfirmed, 'value', value)
    }

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
                        <a href="/rooms/delete/${r.id}" class="btn btn-sm btn-outline-info" rel=${r.id} onClick=${testPrompt} data-native>???</a>
                    </td>
                </tr>
            `)}
            </tbody>
        </table>
    `;
}
