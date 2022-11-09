import { html } from '../../../imports.js';
import { formatMessageDate } from '../../../utils.js';

export default function GeneralMessage(props) {
    const { message: { date, text, from, display, fromUser, whisper }, showTime, cutLongUsername } = props;
    let theName = display ?? from;
    if (fromUser && fromUser.displayName) theName = fromUser.displayName;
    const cutClass = cutLongUsername ? 'cut-long-username' : '';
    const clWhisper = whisper ? 'whisper' : '';
    return html`
        <div class="ml-message general-message ${clWhisper}">
            <span class="date-from">
                ${showTime && html`<span class="date">[${formatMessageDate(date)}]</span>`}
                <span class="from ${cutClass}" title=${theName}>${theName}:</span>
            </span>
            <span class="text">${text}</span>
        </div>
    `;
}
