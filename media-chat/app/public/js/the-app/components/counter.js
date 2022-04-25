import { html, useSelector, useDispatch } from '../imports.js';
import { decrement, increment } from '../redux-toolkit/slices/counter-slice.js';

export default function Counter() {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return html`
        <div class="counter">
            <span>counter: ${count}</span>
            
            <button onClick=${() => dispatch(increment())} class="btn btn-secondary mx-1">
                +1
            </button>
    
            <button onClick=${() => dispatch(decrement())} class="btn btn-secondary">
                -1
            </button>
        </div>
        
    `;
}
