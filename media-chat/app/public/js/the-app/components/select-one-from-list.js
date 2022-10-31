import { html, useSelector, useState, useCallback, useEffect } from '../imports.js';


export default function SelectOneFromList({ items, selected }) {
    const [itemId, setItemId] = useState(selected);
    //console.log('SelectOneFromList items', items);
    useEffect(() => {

        return () => {

        }
    }, []);

    return html`
        <div class="select-one-from-list">
        <ul class="list-group list-group-flush">
            ${items.map((item, idx) => (
                html`<li class="list-group-item" key=${item.id}>${item.name}</li>`
            ))}
        </ul>
        </div>
    `;
}
