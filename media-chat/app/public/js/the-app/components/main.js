import { html, useSelector, useDispatch } from '../imports.js';
import MessagesList from './chat/messages-list.js';
import UsersList from './chat/users-list.js';
import SendMessage from './chat/send-message.js';


export default function Main() {
    return html`
        <div class="chat-layout">
            <div class="cl-messages">
                <${MessagesList} />
            </div>
            <div class="cl-users">
                <${UsersList} />
            </div>
            <div class="cl-send-message">
                <${SendMessage} />
            </div>
        </div>
    `;
}
