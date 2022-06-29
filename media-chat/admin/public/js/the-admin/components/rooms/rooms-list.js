import { html, useEffect, useSelector, useDispatch } from '../../imports.js';
import { selectRooms } from '../../redux-toolkit/slices/textroom-slice.js';

export default function RoomsList(props) {
    const { mode } = props;
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
                <th>private</th>
                <th>history</th>
                <th>pin</th>
                <th>participants</th>
            </thead>
            <tbody>
            ${rooms.map(room => html`
                <tr>
                    <td>${room.id}</td>
                    <td>${room.description}</td>
                    <td>${room.private ? 'Yes' : 'No'}</td>
                    <td>${room.history}</td>
                    <td>${room.pin ? 'Yes' : 'No'}</td>
                    <td>${room.num_participants}</td>
                </tr>
            `)}
            </tbody>
        </table>
    `;
}
