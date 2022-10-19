import { html } from '../../../imports.js';
import { formatMessageDate } from '../../../utils.js';

export default function GeneralMessage(props) {
    const { message: { date, from, display, text, user } } = props;
    let theName = display ?? from;
    if (user && user.displayName) theName = user.displayName;

    return html`
        <div class="ml-message general-message">
            <span class="date-from">
                <span class="date">[${formatMessageDate(date)}]</span>
                <span class="from">${theName}:</span>
            </span>
            <span class="text">${text}</span>
        </div>
    `;
}
