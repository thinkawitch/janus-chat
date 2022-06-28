import { html, useDispatch, Router, useState, useCallback } from '../imports.js';
import HeaderSideMenu from './main/header-side-menu.js';
import Users from './users.js';
import Rooms from './rooms.js';


export default function Main() {
    const handleRouteChange = useCallback(e => {
        //console.warn('handleRouteChange: updates state, leads to re-renders, e', e)
        // do re-render, replaced with useRouter
        //dispatch(setCurrentRoute({ url: e.url, previous: e.previous }));
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
                <${Users} path="/users" />
                <${Rooms} path="/rooms"/>
                <div default>
                    <h1>Dashboard</h1>
                </div>
            </Router>
        </div>
    `;
}
