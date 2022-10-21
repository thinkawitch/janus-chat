import { html, useRef, useEffect, useCallback, useSelector, useDispatch } from '../../imports.js';
import { MESSAGE_TYPE_GENERAL, MESSAGE_TYPE_SYSTEM } from '../../constants.js';
import SystemMessage from './messages/system-message.js';
import GeneralMessage from './messages/general-message.js';
import { selectTextRoom } from '../../redux-toolkit/slices/text-room-slice.js';
import { selectUser } from '../../redux-toolkit/slices/user-slice.js';
import { selectSettings } from '../../redux-toolkit/slices/settings-slice.js';

export default function MessagesList() {
    const { messages } = useSelector(selectTextRoom);
    const { showTime, cutLongUsername } = useSelector(selectSettings);
    const user = useSelector(selectUser);
    const panelRef = useRef(null);

    let shouldScrollBottom = true; // first time always scroll to bottom, we receive history messages, then render
    const panel = panelRef.current;
    if (panel) shouldScrollBottom = panel.scrollTop + panel.offsetHeight === panel.scrollHeight;

    useEffect(() => {
        const lastMessage = messages.length > 1 ? messages[messages.length - 1] : null;
        const username = user.username;
        const panel = panelRef.current;
        // console.log('[ML][effect] shouldScrollBottom', shouldScrollBottom)
        // scroll to bottom only if this is my owm message, or I did not change the scroll position
        if (shouldScrollBottom || (lastMessage && lastMessage.type === MESSAGE_TYPE_GENERAL && lastMessage.from == username)) {
            panel.scrollTop = panel.scrollHeight;
        }
    });

    return html`
        <div class="messages-list" ref=${panelRef}>
            ${messages.map((message,key) => {
                switch (message.type) {
                    case MESSAGE_TYPE_SYSTEM:
                        return html`<${SystemMessage} key=${'msk-'+key} message=${message} showTime=${showTime} />`;
                    case MESSAGE_TYPE_GENERAL:
                        return html`<${GeneralMessage} key=${'mgk-'+key} message=${message} showTime=${showTime} cutLongUsername=${cutLongUsername} />`;
                }
            })}
        </div>
    `;
}
