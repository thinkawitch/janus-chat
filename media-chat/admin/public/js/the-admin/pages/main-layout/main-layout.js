import { html, Router, useCallback } from '../../imports.js';
import HeaderSideMenu from './header-side-menu.js';
import Home from './../home.js';
import Users from './../users.js';
import Rooms from './../rooms/rooms.js';
import AddRoom from './../rooms/add-room.js';
import EditRoom from './../rooms/edit-room.js';
import Me from './../me/me.js';
import { DialogConfirm, DialogAlert, DialogPrompt } from '../../components/andrew-preact-dialog/dialog-component.js';
import { ToastHolder } from '../../components/andrew-preact-bootstrap-toast/toast-component.js';
import { useToast } from '../../components/andrew-preact-bootstrap-toast/toast-hook.js';
import mediaChatApi from '../../media-chat-api.js';

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

    // must be inside ToastContextProvider
    const { addToast } = useToast();
    mediaChatApi.setDisplayErrorHandler(message => {
        console.error(message);
        addToast({ message, type: 'danger', delay: 10000 });
    })

    return html`
        <${HeaderSideMenu} />
        <div class="container-lg">
            <${Router} onChange=${handleRouteChange}>
                <${Home} default />
                <${Users} path="/users" />
                <${Rooms} path="/rooms" />
                <${AddRoom} path="/rooms/add" />
                <${EditRoom} path="/rooms/edit/:roomId" />
                <${Me} path="/me" />
            </Router>
        </div>
        <${DialogConfirm} />
        <${DialogAlert} />
        <${DialogPrompt} />
        <${ToastHolder} position="top-right" />
    `;
}
