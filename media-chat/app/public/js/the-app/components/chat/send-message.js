import { html, useRef, useEffect, useCallback, useSelector, useDispatch, useState } from '../../imports.js';
import { sendMessage } from '../../janus-api/janus-api.js';
import { selectJanus } from '../../redux-toolkit/slices/janus-slice.js';
import SelectOneFromList from '../select-one-from-list.js';
import { selectUsersForMentionList } from '../../redux-toolkit/slices/users-slice.js';


export default function SendMessage() {
    const inputRef = useRef(null);
    const backdropRef = useRef(null);
    const highlighterRef = useRef(null);

    const [to, setTo] = useState(null); // whisper (private) message to username
    const [tos, setTos] = useState([]); // whisper (private) message to usernames

    const [showSelectUser, setShowSelectUser] = useState(false);
    const usersForMentionList = useSelector(selectUsersForMentionList);

    const onSelectUser = useCallback((username) => {
        console.log('onSelectUser', username); // not username, but full user required
        setTo(username);
        setTos([...tos, username]);
        setShowSelectUser(false);
        //inputRef.current.insertAdjacentText('afterbegin', username)
        inputRef.current.setRangeText(
            username + ' ',
            inputRef.current.selectionStart,
            inputRef.current.selectionEnd,
            'end'
        )
    }, [tos]);

    const onCancelUser = useCallback(() => {
        setShowSelectUser(false);
    }, []);

    const onSubmit = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = inputRef.current;
        const message = String(input.value).trim();
        if (message === '') return;
        //console.log('message', message, to);
        sendMessage(message, to, tos);
        input.value = '';
        setTo(null);
        setTos([]);
        if (!(input === document.activeElement)) {
            input.focus();
        }
    }, [inputRef.current, to, tos]);

    useEffect(() => {
        function handleSubmit(e) {
            if (e.key !== 'Enter') return;
            if (showSelectUser) { // just select user
                e.preventDefault();
                return false;
            }

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
    }, [onSubmit, showSelectUser, inputRef.current]);

    useEffect(() => {
        function handleMentions(e) {
            if (showSelectUser && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                return;
            }
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
    }, [showSelectUser]);

    useEffect(() => {
        function handleHighlight(e) {
            const text = inputRef.current.value;
            const highlightedText = applyHighlights(text);
            highlighterRef.current.innerHTML = highlightedText; // danger!
            handleScroll();
        }
        function handleScroll() {
            const backdrop = backdropRef.current;
            const textarea = inputRef.current;
            //console.log('textarea scrollTop', textarea.scrollTop)
            backdrop.scrollTop = textarea.scrollTop;
            backdrop.scrollLeft = textarea.scrollLeft;
            //console.log('backdrop scrollTop', backdrop.scrollTop)
        }
        inputRef.current.addEventListener('keyup', handleHighlight);
        inputRef.current.addEventListener('beforeinput', handleHighlight);
        inputRef.current.addEventListener('scroll', handleScroll);
        return () => {
            inputRef.current.removeEventListener('scroll', handleScroll);
            inputRef.current.removeEventListener('keyup', handleHighlight);
        }
    }, [])

    const { textRoomJoined } = useSelector(selectJanus);
    const disabled = !textRoomJoined;
    const placeholder = !textRoomJoined ? 'Loading ...' : 'Enter message';

    return html`
        <div class="send-message">
            <form onSubmit=${onSubmit}>
                <div class="message-with-highlight">
                    <div class="message-backdrop" ref=${backdropRef}>
                        <div class="message-highlighter" ref=${highlighterRef}></div>
                    </div>
                    <div class="message-textarea">
                        <textarea ref=${inputRef} disabled=${disabled} placeholder=${placeholder}></textarea>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary ms-0" disabled=${disabled}>Send</button>
            </form>
            ${showSelectUser && html`<${SelectOneFromList} items=${usersForMentionList} selected=${to} onSelect=${onSelectUser} onCancel=${onCancelUser} />`}
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


// https://codersblock.com/blog/highlight-text-inside-a-textarea/
function applyHighlights(text) {
    return text
        .replace(/\n$/g, '\n\n')
        //.replace(/[A-Z].*?\b/g, '<mark>$&</mark>');
        //.replace(/@[^.\s].*?\b/g, '<mark>$&</mark>'); //my
        .replace(/@(\w+)(?!\w)/g, '<mark>$&</mark>'); // https://stackoverflow.com/questions/13554208/javascript-regex-match-any-word-that-starts-with-in-a-string
}
