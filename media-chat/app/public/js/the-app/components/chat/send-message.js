import { html, useRef, useEffect, useCallback, useSelector, useDispatch, useState } from '../../imports.js';
import { sendMessage } from '../../janus-api/janus-api.js';
import { selectJanus } from '../../redux-toolkit/slices/janus-slice.js';
import SelectOneFromList from '../select-one-from-list.js';
import { selectUsers, selectUsersForMentionList } from '../../redux-toolkit/slices/users-slice.js';


export default function SendMessage() {
    const inputRef = useRef(null);
    const backdropRef = useRef(null);
    const highlighterRef = useRef(null);

    const [to, setTo] = useState(null); // whisper (private) message to username
    const [tos, setTos] = useState([]); // whisper (private) message to usernames
    const [mentions, setMentions] = useState([]); // users selected to mention, replace with set for unique

    const [showSelectUser, setShowSelectUser] = useState(false);
    const usersForMentionList = useSelector(selectUsersForMentionList);
    const users = useSelector(selectUsers);

    const updateScrollForHighlights = useCallback(() => {
        const backdrop = backdropRef.current;
        const textarea = inputRef.current;
        backdrop.scrollTop = textarea.scrollTop;
        backdrop.scrollLeft = textarea.scrollLeft;
    }, [inputRef.current, backdropRef.current]);

    const highlightMentionedUsers = useCallback(() => {
        const text = inputRef.current.value;
        const highlightedText = applyHighlightsForMentionedUsers(text, mentions);
        highlighterRef.current.innerHTML = highlightedText; // danger!
        updateScrollForHighlights();
    }, [inputRef.current, highlighterRef.current, updateScrollForHighlights, mentions]);

    const onSelectUser = useCallback((username) => {
        console.log('onSelectUser', username); // not username, but full user required
        const user = users.find(u => u.username === username);
        if (!user) return;
        console.log('@user', user);
        setTo(username);
        setTos([...tos, username]);
        setMentions([...mentions, user])
        setShowSelectUser(false);
        inputRef.current.setRangeText(
            user.displayName + ' ',
            inputRef.current.selectionStart,
            inputRef.current.selectionEnd,
            'end'
        );
        /*setTimeout(() => {
        //window.requestAnimationFrame(() =>{
            inputRef.current.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
        }, 100)*/
        highlightMentionedUsers();
    }, [tos, mentions, highlightMentionedUsers]);

    const onCancelUser = useCallback(() => {
        setShowSelectUser(false);
    }, []);

    useEffect(() => {
        // trigger highlighter to do
        window.requestAnimationFrame(() =>{
            //inputRef.current.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
            highlightMentionedUsers();
        })
    }, [/*mentions*/highlightMentionedUsers]);


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
        setMentions([]);
        if (!(input === document.activeElement)) {
            input.focus();
        }
    }, [inputRef.current, to, tos, mentions]);

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
        /*function handleHighlight(e) {
            const text = inputRef.current.value;
            //const highlightedText = applyHighlights(text);
            const highlightedText = applyHighlightsForMentionedUsers(text, mentions);
            console.log('highlightedText', JSON.stringify(highlightedText))
            highlighterRef.current.innerHTML = highlightedText; // danger!
            handleScroll();
        }
        function handleScroll() {
            const backdrop = backdropRef.current;
            const textarea = inputRef.current;
            backdrop.scrollTop = textarea.scrollTop;
            backdrop.scrollLeft = textarea.scrollLeft;
        }*/
        inputRef.current.addEventListener('input', highlightMentionedUsers);
        inputRef.current.addEventListener('scroll', updateScrollForHighlights);
        return () => {
            inputRef.current.removeEventListener('scroll', updateScrollForHighlights);
            inputRef.current.removeEventListener('input', highlightMentionedUsers);
        }
    }, [mentions])

    const { textRoomJoined } = useSelector(selectJanus);
    const disabled = !textRoomJoined;
    const placeholder = !textRoomJoined ? 'Loading ...' : 'Enter message, type @ to mention user for whisper message';

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

function applyHighlightsForMentionedUsers(text, users) {
    let result = text.replace(/\n$/g, '\n\n');
    users.forEach(u => {
        const searchFor = new RegExp(escapeRegExp('@'+u.displayName), 'g');
        const replaceWith = escapeReplacement(`<mark data-username="${u.username}">@${u.displayName}</mark>`);
        result = result.replace(searchFor, replaceWith);
    });
    return result;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function escapeReplacement(string) {
    return string.replace(/\$/g, '$$$$');
}
