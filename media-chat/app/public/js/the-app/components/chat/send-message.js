import { html, useRef, useEffect, useCallback, useSelector, useDispatch } from '../../imports.js';
//import { sendMessage } from '../../janus-api.js';
import { sendMessage } from '../../janus-api/janus-api.js';
import { selectJanus } from '../../redux-toolkit/slices/janus-slice.js';


export default function SendMessage() {

    const inputRef = useRef(null);

    const onSubmit = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = inputRef.current;
        const message = String(input.value).trim();
        if (message === '') return;
        //console.log('message', message);
        //this.props.actions.sendMessage(message);
        sendMessage(message);
        input.value = '';
        if (!(input === document.activeElement)) {
            input.focus();
        }
    }, [inputRef.current]);

    useEffect(() => {
        inputRef.current.onkeydown = (e) => {
            if (e.key !== 'Enter') return;

            if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
                onSubmit(e); // submit by single ENTER key without modifiers
                return;
            }

            if (e.shiftKey) return; // do nothing, browser will move to next line itself

            if (e.altKey || e.ctrlKey) {
                inputRef.current.value += '\n'; // add next line char
                inputRef.current.scrollTop = 999999; // move to the end
            }
        }
        inputRef.current.focus();
    }, []);

    const { textRoomJoined } = useSelector(selectJanus);
    const disabled = !textRoomJoined;
    const placeholder = !textRoomJoined ? 'Loading ...' : 'Enter message';

    return html`
        <div class="send-message">
            <form onSubmit=${onSubmit}>
                <textarea ref=${inputRef} disabled=${disabled} placeholder=${placeholder}></textarea>
                <button type="submit" class="btn btn-primary ms-0" disabled=${disabled}>Send</button>
            </form>
        </div>
    `;
}
