import { html, useSelector, useDispatch } from '../imports.js';
import MessagesList from './chat/messages-list.js';
import UsersList from './chat/users-list.js';
import SendMessage from './chat/send-message.js';


export default function Main() {
    return html`
        <div class="mc-chat-layout">
            <div class="mc-cl-messages">
                <${MessagesList} />
            </div>
            <div class="mc-cl-users">
                <${UsersList} />
            </div>
            <div class="mc-cl-send-message">
                <${SendMessage} />
            </div>
        </div>
    `;
}
