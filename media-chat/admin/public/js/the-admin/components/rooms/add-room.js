import { html, useEffect, useSelector, useDispatch } from '../../imports.js';
import RoomForm from './room-form.js';

export default function AddRoom() {
    return html`
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/rooms">Rooms</a></li>
                <li class="breadcrumb-item active" aria-current="page">Add room</li>
            </ol>
        </nav>
        <${RoomForm} mode="add" />
    `;
}
