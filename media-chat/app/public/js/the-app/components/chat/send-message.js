import { html, useRef, useEffect, useCallback, useSelector, useDispatch, useState } from '../../imports.js';
import { sendMessage } from '../../janus-api/janus-api.js';
import { selectJanus } from '../../redux-toolkit/slices/janus-slice.js';
import SelectOneFromList from '../select-one-from-list.js';
import { selectUsersForMentionList } from '../../redux-toolkit/slices/users-slice.js';


export default function SendMessage() {

    const inputRef = useRef(null);
    const [to, setTo] = useState(null); // whisper (private) message to username
    const [showSelectUser, setShowSelectUser] = useState(false);
    const usersForMentionList = useSelector(selectUsersForMentionList);

    const onSubmit = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = inputRef.current;
        const message = String(input.value).trim();
        if (message === '') return;
        //console.log('message', message, to);
        sendMessage(message, to);
        input.value = '';
        setTo(null);
        if (!(input === document.activeElement)) {
            input.focus();
        }
    }, [inputRef.current, to]);

    useEffect(() => {
        function handleSubmit(e) {
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

        inputRef.current.addEventListener('keydown', handleSubmit);
        inputRef.current.focus(); // may be set focus one time only? on first render?

        return () => {
            inputRef.current.removeEventListener('keydown', handleSubmit);
        }
    }, [onSubmit]);

    useEffect(() => {
        function handleMentions(e) {
            if (e.key === '@') {
                console.log('@');
                // show popover with users list to select
                //setTo('user1');
                setShowSelectUser(true);
                //
                //console.log('caret coordinates', getCaretCoordinates());
                //console.log('textarea rec', inputRef.current.getBoundingClientRect());
            }
            if (e.key === 'Escape') {
                setShowSelectUser(false);
            }
        }
        inputRef.current.addEventListener('keydown', handleMentions);
        return () => {
            inputRef.current.removeEventListener('keydown', handleMentions);
        }
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
            ${showSelectUser && html`<${SelectOneFromList} items=${usersForMentionList} />`}
        </div>
    `;
}

// https://javascript.plainenglish.io/how-to-find-the-caret-inside-a-contenteditable-element-955a5ad9bf81
// does not work as expected
function getCaretCoordinates() {
    let x = 0,
        y = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
            const range = selection.getRangeAt(0).cloneRange();
            range.collapse(true);
            /*const rect = range.getClientRects()[0];
            if (rect) {
                x = rect.left;
                y = rect.top;
            }*/
            // my
            const div = document.createElement('div')
            div.style.width = '1px';
            div.style.height = '1px';
            range.insertNode(div);
            //const rect = div.getClientRects()[0];
            const rect = div.getBoundingClientRect();
            if (rect) {
                x = rect.left;
                y = rect.top;
            }
            range.deleteContents();
        }
    }
    return { x, y };
}
