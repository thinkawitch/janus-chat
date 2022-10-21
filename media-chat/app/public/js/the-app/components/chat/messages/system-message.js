import { html } from '../../../imports.js';
import { formatMessageDate } from '../../../utils.js';

export default function SystemMessage(props) {
    const { message: { date, text }, showTime } = props;

    return html`
        <div class="ml-message system-message">
            ${showTime && html`<span class="date">[${formatMessageDate(date)}]</span>`}
            <span class="text">${text}</span>
        </div>
    `;
}
