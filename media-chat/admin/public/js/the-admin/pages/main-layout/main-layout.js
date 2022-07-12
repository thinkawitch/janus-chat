import { html, useDispatch, Router, useState, useCallback } from '../../imports.js';
import HeaderSideMenu from './header-side-menu.js';
import Home from './../home.js';
import Users from './../users.js';
import Rooms from './../rooms/rooms.js';
import AddRoom from './../rooms/add-room.js';
import EditRoom from './../rooms/edit-room.js';
import { DialogContextProvider } from '../../components/andrew-preact-dialog/dialog-context.js';
import { DialogConfirm, DialogAlert, DialogPrompt } from '../../components/andrew-preact-dialog/dialog-component.js';


export default function MainLayout() {
    const handleRouteChange = useCallback(e => {
        //console.warn('handleRouteChange: updates state, leads to re-renders, e', e)
        // do re-render, replaced with useRouter
        //dispatch(setCurrentRoute({ url: e.url, previous: e.previous }));
        const psm = document.getElementById('pageSideMenu');
        if (psm) {
            const offcanvas = bootstrap.Offcanvas.getInstance(psm);
            offcanvas?.hide();
        }
    }, []);

    return html`
        <${DialogContextProvider}>
            <${HeaderSideMenu} />
            <div class="container-lg">
                <${Router} onChange=${handleRouteChange}>
                    <${Home} default />
                    <${Users} path="/users" />
                    <${Rooms} path="/rooms" />
                    <${AddRoom} path="/rooms/add" />
                    <${EditRoom} path="/rooms/edit/:roomId" />
                </Router>
            </div>
            <${DialogConfirm} />
            <${DialogAlert} />
            <${DialogPrompt} />
        </>
    `;
}
