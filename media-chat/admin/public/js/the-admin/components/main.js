import { html, useSelector, useDispatch, Router, route, useState, useCallback, useEffect } from '../imports.js';
import { setCurrentRoute } from '../redux-toolkit/slices/router-slice.js';
import Login from './login.js';
import HeaderSideMenu from './main/header-side-menu.js';
import Users from './users.js';
import Rooms from './rooms.js';


export default function Main() {
    const dispatch = useDispatch();
    const [ showPanel, setShowPanel ] = useState(false);

    const togglePanel = useCallback(() => {
        setShowPanel(!showPanel);
    }, [showPanel]);

    const hidePanel = useCallback(e => {
        e && e.preventDefault();
        setShowPanel(false);
    }, [setShowPanel]);

    const handleRouteChange = useCallback(e => {
        //console.log('handleRouteChange e', e)
        dispatch(setCurrentRoute({ url: e.url, previous: e.previous }));
        const psm = document.getElementById('pageSideMenu');
        if (psm) {
            const offcanvas = bootstrap.Offcanvas.getInstance(psm);
            if (offcanvas) {
                // it is opened
                offcanvas.hide();
            }
        }
    }, []);

    return html`
        <${HeaderSideMenu} />
        <div class="container-lg">
            <${Router} onChange=${handleRouteChange}>
                <!--< $ {Login} path="/login" />-->
                <${Users} path="/users" />
                <${Rooms} path="/rooms"/>
                <div default>
                    <h1>Dashboard</h1>
    
                    <button class="btn btn-primary" type="button" onClick=${togglePanel}>toggle panel</button>
                    
                    ${showPanel && html`
                        <div class="dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                Dropdown button
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                <li><a class="dropdown-item" href="#">Action</a></li>
                                <li><a class="dropdown-item" href="#">Another action</a></li>
                                <li><a class="dropdown-item" href="#">Something else here</a></li>
                                <li><a class="dropdown-item" href="#" onClick=${hidePanel}>Hide panel</a></li>
                            </ul>
                        </div>`
                    }
                    
                </div>
            </Router>
        </div>
    `;
}
