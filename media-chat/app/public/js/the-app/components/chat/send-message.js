import { html, useRef, useEffect, useCallback, useSelector, useState, useMemo } from '../../imports.js';
import { sendMessage } from '../../janus-api/janus-api.js';
import { selectJanus } from '../../redux-toolkit/slices/janus-slice.js';
import SelectOneFromList from '../select-one-from-list.js';
import { selectUsers, selectUsersForMentionList } from '../../redux-toolkit/slices/users-slice.js';

// const ua = window.navigator.userAgent.toLowerCase();
// const isFirefox = ua.indexOf('firefox') !== -1;
// const isIos = !!ua.match(/ipad|iphone|ipod/) && ua.indexOf('windows phone') === -1;

export default function SendMessage() {
    const inputRef = useRef(null);
    const backdropRef = useRef(null);
    const highlighterRef = useRef(null);

    const [tos, setTos] = useState([]); // whisper (private) message to usernames
    const [showSelectUser, setShowSelectUser] = useState(false); // show panel with users to select
    const usersForMentionList = useSelector(selectUsersForMentionList);
    const users = useSelector(selectUsers);

    const mentions = useMemo(() => {
        const list = [];
        tos.forEach(username => {
            const user = users.find(u => u.username === username);
            if (user) list.push(user);
        });
        return list;
    }, [users, tos]);
    const lastMentioned = useMemo(() => {
        if (tos.length > 0) return tos[tos.length-1];
        return null;
    }, [tos]);

    const addUserToMentioned = useCallback(() => {
        // when typing character one by one
        const text = String(inputRef.current.value);
        users.forEach(u => {
           if (text.includes(`@${u.displayName} `)) {
               setTos(prevTos => {
                   if (prevTos.includes(u.username)) return prevTos;
                   return [...prevTos, u.username];
               })
           }
        });
    }, [inputRef.current, users]);

    const cleanUnmentionedUsers = useCallback(() => {
        // when deleting chars
        // check if mentioned are still in text, clean otherwise
        // false flashy, maybe should check by textarea value ?
        const html = highlighterRef.current.innerHTML;
        const existingTos = [];
        let changed = false;
        mentions.forEach(u => {
            if (html.includes(`data-username="${u.username}"`)) {
                existingTos.push(u.username);
            } else {
                changed = true;
            }
        })
        if (changed) {
            setTos(existingTos);
        }
    }, [highlighterRef.current, mentions]);

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
        setTos(prevTos => {
            if (prevTos.includes(username)) return prevTos;
            return [...prevTos, username];
        });
        setShowSelectUser(false);
        inputRef.current.setRangeText(
            user.displayName + ' ',
            inputRef.current.selectionStart,
            inputRef.current.selectionEnd,
            'end'
        );
        inputRef.current.focus();
        highlightMentionedUsers();
    }, [users, highlightMentionedUsers]);

    const onCancelUser = useCallback(() => {
        setShowSelectUser(false);
    }, []);

    useEffect(() => {
        // trigger highlighter to do
        window.requestAnimationFrame(() =>{
            //inputRef.current.dispatchEvent(new Event('input', {'bubbles': true, 'cancelable': true}));
            highlightMentionedUsers();
        })
    }, [highlightMentionedUsers]);


    const onSubmit = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const input = inputRef.current;
        const message = String(input.value).trim();
        if (message === '') return;
        sendMessage(message, tos);
        input.value = '';
        setTos([]);
        if (!(input === document.activeElement)) {
            input.focus();
        }
    }, [inputRef.current, tos]);

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
        function handlePanelWithUsers(e) {
            if (showSelectUser && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                return;
            }
            if (e.key === '@') {
                // show popover with users list to select
                setShowSelectUser(true);
                //
                //console.log('caret coordinates', getCaretCoordinates());
                //console.log('textarea rec', inputRef.current.getBoundingClientRect());
            }
            if (e.key === 'Escape') {
                setShowSelectUser(false);
            }
        }
        inputRef.current.addEventListener('keydown', handlePanelWithUsers);
        return () => {
            inputRef.current.removeEventListener('keydown', handlePanelWithUsers);
        }
    }, [showSelectUser]);

    useEffect(() => {
        inputRef.current.addEventListener('input', addUserToMentioned);
        inputRef.current.addEventListener('input', cleanUnmentionedUsers);
        inputRef.current.addEventListener('input', highlightMentionedUsers);
        inputRef.current.addEventListener('scroll', updateScrollForHighlights);
        return () => {
            inputRef.current.removeEventListener('scroll', updateScrollForHighlights);
            inputRef.current.removeEventListener('input', highlightMentionedUsers);
            inputRef.current.removeEventListener('input', cleanUnmentionedUsers);
            inputRef.current.removeEventListener('input', addUserToMentioned);

        }
    }, [mentions]);

    const { textRoomJoined, textRoomDestroyed } = useSelector(selectJanus);
    const disabled = !textRoomJoined || textRoomDestroyed;
    let placeholder = 'Enter message, type @ to mention user for whisper message';
    if (textRoomDestroyed) placeholder = 'Room stopped.'
    else if (!textRoomJoined) placeholder = 'Loading ...';
    //const placeholder = !textRoomJoined ? 'Loading ...' : 'Enter message, type @ to mention user for whisper message';

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
                <button type="submit" class="btn btn-primary" disabled=${disabled}>Send</button>
            </form>
            ${showSelectUser && html`<${SelectOneFromList} items=${usersForMentionList} selected=${lastMentioned} onSelect=${onSelectUser} onCancel=${onCancelUser} />`}
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
