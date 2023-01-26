import { html, useSelector, useDispatch, useCallback, useEffect, useState } from '../../imports.js';
import useDebouncedCallback from '../../components/samuherek-use-debounce-preact.js';
import { setFilter, cleanFilter, selectTextRoom } from '../../redux-toolkit/slices/rooms-slice.js';

export default function RoomsFilter() {
    const dispatch = useDispatch();
    const { filter } = useSelector(selectTextRoom);
    const [ fields, setFields ] = useState({ description: '' });

    useEffect(() => {
        const updateFields = {};
        for (const f in filter) updateFields[f] = filter[f];
        setFields(updateFields);
    }, [filter.description])

    /*const [debouncedSetFilter] = useDebouncedCallback((e) => {
            dispatch(setRoomFilter({ description: e.target.value }));
        },300, []
    );*/

    const doSetFilter = useCallback(e => {
        dispatch(setFilter({ description: e.target.value }));
    }, [])

    const doEscapeFilter = useCallback(e => {
        if (e.key === 'Escape') {
            dispatch(cleanFilter());
        }
    }, [])

    const doCleanFilter = useCallback(e => {
        e.preventDefault();
        dispatch(cleanFilter());
    }, [])

    const showClear = fields.description?.length > 0;

    return html`
        <div class="input-group input-group-sm" style="max-width: 300px">
            <span class="input-group-text" id="rooms-filter-descr"><svg class="bi" width="16" height="16"><use xlink:href="#bi-filter"></use></svg></span>
            <input type="text" value=${fields.description} onInput=${doSetFilter} onKeyUp=${doEscapeFilter} class="form-control" placeholder="Description" aria-label="Description" aria-describedby="rooms-filter-descr" />
            ${showClear && html`
                <a class="d-block position-absolute" style="z-index:100; top: 2px; right: 5px;" onclick=${doCleanFilter}>
                    <svg class="bi" width="16" height="16"><use xlink:href="#bi-x-circle"></use></svg>
                </a>
            `}
        </div>
    `;
}
