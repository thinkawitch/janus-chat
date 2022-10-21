import { html } from '../../../imports.js';
import { formatMessageDate } from '../../../utils.js';

export default function GeneralMessage(props) {
    const { message: { date, from, display, text, user }, showTime, cutLongUsername } = props;
    let theName = display ?? from;
    if (user && user.displayName) theName = user.displayName;
    let cutClass = '';
    if (cutLongUsername) cutClass = 'cut-long-username';

    return html`
        <div class="ml-message general-message">
            <span class="date-from">
                ${showTime && html`<span class="date">[${formatMessageDate(date)}]</span>`}
                <span class="from ${cutClass}" title=${theName}>${theName}:</span>
            </span>
            <span class="text">${text}</span>
        </div>
    `;
}
