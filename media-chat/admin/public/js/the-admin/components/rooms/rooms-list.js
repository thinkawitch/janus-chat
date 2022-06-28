import { html, useEffect, useSelector, useDispatch } from '../../imports.js';
import { selectRooms } from '../../redux-toolkit/slices/textroom-slice.js';

export default function RoomsList() {
    const { textRoom: { loading, rooms, notInitialized } } = useSelector(state => state);
    //const rooms = useSelector(selectRooms);
    console.log('rooms', rooms);

    if (notInitialized) return null;

    if (!loading && !rooms.length) return html`<p>No rooms</p>`;

    return html`
        <table class="table">
            <thead>
                <th>#</th>
                <th>description</th>
                <th>history</th>
                <th>pin</th>
                <th>participants</th>
            </thead>
            <tbody>
            ${rooms.map(room => html`
                <tr>
                    <td>${room.room}</td>
                    <td>${room.description}</td>
                    <td>${room.history}</td>
                    <td>${room.pin_required ? 'Yes' : 'No'}</td>
                    <td>${room.num_participants}</td>
                </tr>
            `)}
            </tbody>
        </table>
    `;
}
