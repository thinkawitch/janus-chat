import { html, useSelector, useState, useCallback, useEffect, useRef } from '../imports.js';


export default function SelectOneFromList({ items, selected, onSelect, onCancel }) {
    const [itemId, setItemId] = useState(selected);
    const refContainer = useRef(null);
    const refActive = useRef(null);

    useEffect(() => {
        if (!itemId) setItemId(items[0].id); // select first by default
    }, [])

    const onItemClick = useCallback(e => {
        e.preventDefault();
        onSelect(e.target.dataset.mention);
    }, []);

    //console.log('SelectOneFromList items', items);
    useEffect(() => {
        const handleSelect = e => {
            //console.log('handleSelect', e);
            switch (e.key) {
                case 'ArrowUp':
                    setItemId(getPrevItemId(items, itemId));
                    break;
                case 'ArrowDown':
                    setItemId(getNextItemId(items, itemId));
                    break;
                case 'Enter':
                    onSelect(itemId);
                    break;
                default:
                    onCancel();
                    break;
            }
        }
        window.addEventListener('keydown', handleSelect);
        return () => {
            window.removeEventListener('keydown', handleSelect)
        }
    }, [itemId]);

    useEffect(() => {
        if (refActive.current && refContainer.current) {
            scrollToBeVisible(refActive.current, refContainer.current);
        }
    }, [itemId]);

    return html`
        <div class="select-one-from-list"  ref=${refContainer}>
            <div class="list-group list-group-flush flex-grow-1">
                ${items.map(item => {
                    const ca = item.id === itemId ? 'active' : '';
                    const refProp = item.id === itemId ? {'ref': refActive} : {};
                    return html`<a href="#" data-mention="${item.id}" class="list-group-item text-nowrap text-truncate ${ca}" key=${item.id} ...${refProp} onclick=${onItemClick}>${item.name}</a>`
                })}
            </div>
        </div>
    `;
}


function getCurrentItemIdx(items, itemId) {
    let idx = -1;
    items.some((item, i) => {
        if (item.id === itemId) {
            idx = i;
            return true;
        }
    })
    return idx;
}

function getPrevItemId(items, itemId) {
    const currIdx = getCurrentItemIdx(items, itemId);
    let prevIdx = currIdx - 1;
    if (prevIdx < 0) prevIdx = items.length - 1;
    return items[prevIdx].id;
}

function getNextItemId(items, itemId) {
    const currIdx = getCurrentItemIdx(items, itemId);
    let nextIdx = currIdx + 1;
    if (nextIdx >= items.length) nextIdx = 0;
    return items[nextIdx].id;
}

// https://htmldom.dev/check-if-an-element-is-visible-in-a-scrollable-container/
const isVisible = function (ele, container) {
    const { bottom, height, top } = ele.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return top <= containerRect.top ? containerRect.top - top <= height : bottom - containerRect.bottom <= height;
};

// https://htmldom.dev/scroll-an-element-to-ensure-it-is-visible-in-a-scrollable-container/
const scrollToBeVisible = function (ele, container) {
    const eleTop = ele.offsetTop;
    const eleBottom = eleTop + ele.clientHeight;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;

    if (eleTop < containerTop) {
        // Scroll to the top of container
        container.scrollTop -= containerTop - eleTop;
    } else if (eleBottom > containerBottom) {
        // Scroll to the bottom of container
        container.scrollTop += eleBottom - containerBottom;
    }
};
