import { html, useEffect, useSelector, useDispatch } from '../../imports.js';
import { selectRooms } from '../../redux-toolkit/slices/textroom-slice.js';

export default function RoomsList(props) {
    const { mode } = props;
    const { textRoom: { loading, rooms, notInitialized } } = useSelector(state => state);
    //const rooms = useSelector(selectRooms);
    //console.log('rooms', rooms);

    if (notInitialized) return null;

    if (!loading && !rooms.length) return html`<p>No rooms</p>`;

    const check = html`<svg class="bi" width="16" height="16"><use xlink:href="#bi-check"></use></svg>`;

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
                </tr>
            `)}
            </tbody>
        </table>
    `;
}
