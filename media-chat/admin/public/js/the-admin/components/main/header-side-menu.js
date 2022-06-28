import { html, useCallback, useDispatch, useSelector } from '../../imports.js';
import { userLogout } from '../../redux-toolkit/actions/auth-actions.js';
import { userGetMe } from '../../redux-toolkit/actions/user-actions.js';
import { textroomGetAll } from '../../redux-toolkit/actions/textroom-actions.js';

export default function HeaderSideMenu() {
    const dispatch = useDispatch();
    const logout = useCallback(e => {
        e && e.preventDefault();
        dispatch(userLogout());
    });
    const { user, router: { url } } = useSelector(store => store);

    const class1HomeActive = url === '/' ? 'link-secondary' : 'link-dark';
    const class1RoomsActive = url === '/rooms' ? 'link-secondary' : 'link-dark';
    const class1UsersActive = url === '/users' ? 'link-secondary' : 'link-dark';

    const class2HomeActive = url === '/' ? 'active' : 'link-dark';
    const class2RoomsActive = url === '/rooms' ? 'active' : 'link-dark';
    const class2UsersActive = url === '/users' ? 'active' : 'link-dark';

    const getMe = useCallback(e => {
        e && e.preventDefault();
        dispatch(userGetMe());
    });

    const textroomGet = useCallback(e => {
        e && e.preventDefault();
        dispatch(textroomGetAll());
    })

    return html`
        <header class="p-3 mb-3 border-bottom">
            <!-- big screen menu -->
            <div class="container d-none d-lg-block">
                <div class="d-flex flex-wrap align-items-center justify-content-start">

                    <!--<a href="#" class="d-none d-lg-flex align-items-center text-dark text-decoration-none">
                        <svg class="bi me-2" width="40" height="32" role="img" aria-label="Bootstrap"><use xlink:href="#bi-bootstrap"/></svg>
                    </a>-->
                    <a href="/" class="d-flex align-items-center">
                        <img height="32" src="/apple-touch-icon.png" />
                    </a>

                    <ul class="nav col-12 col-lg-auto ms-2 me-lg-auto justify-content-center">
                        <li><a href="/" class="nav-link px-2 ${class1HomeActive}">Home</a></li>
                        <li><a href="/rooms" class="nav-link px-2 ${class1RoomsActive}">Rooms</a></li>
                        <li><a href="/users" class="nav-link px-2 ${class1UsersActive}">Users</a></li>

                    </ul>

                    <!--form class="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3">
                        <input type="search" class="form-control" placeholder="Search..." aria-label="Search">
                    </form-->

                    <div class="dropdown text-end">
                        <a href="#" class="d-block link-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                            <!--<img src="https://github.com/mdo.png" alt="mdo" width="32" height="32" class="rounded-circle" />-->
                            <svg class="bi me-2" width="32" height="32"><use xlink:href="#bi-person-circle"></use></svg>
                        </a>
                        <ul class="dropdown-menu text-small" aria-labelledby="dropdownUser1">
                            <li class="dropdown-item">${user.username}</li>
                            <li><hr class="dropdown-divider"/></li>
                            <li><a class="dropdown-item" href="#" onClick=${getMe}>api user.getMe</a></li>
                            <li><a class="dropdown-item" href="#" onClick=${textroomGet}>api textroom.getAll</a></li>
                            <li><a class="dropdown-item" href="#">Settings</a></li>
                            <li><a class="dropdown-item" href="#">Profile</a></li>
                            <li><hr class="dropdown-divider"/></li>
                            <li><a class="dropdown-item" href="#" onClick=${logout}>Sign out</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <!-- small screen menu -->
            <div class="container-fluid d-lg-none">
                <div class="d-flex align-items-center justify-content-start small-screen-menu" href="#pageSideMenu" data-bs-toggle="offcanvas">
                    <!--<a href="#offcanvas" data-bs-toggle="offcanvas" class="d-flex align-items-center text-dark text-decoration-none">
                        <svg class="bi" width="40" height="32" role="img" aria-label="Bootstrap"><use xlink:href="#bi-bootstrap"/></svg>
                    </a>-->
                    <!--<a href="#offcanvas" data-bs-toggle="offcanvas" class="d-flex align-items-center text-dark1 text-decoration-none">
                        <i class="bi bi-list" style="font-size: 2rem"></i>
                    </a>-->
                    <svg class="bi flex-shrink-0" width="32" height="40" role="img" aria-label="Menu"><use xlink:href="#bi-list"/></svg>

                    <ul class="nav justify-content-start ms-2">
                        <li class="px-2">MC Admin Some long long page title 456 54645 654 6</li>
                    </ul>
                </div>
            </div>
        </header>

        <!-- side menu -->
        <div class="offcanvas offcanvas-start" tabindex="-1" id="pageSideMenu" aria-labelledby="pageSideMenuLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="pageSideMenuLabel">MC Admin</h5>
                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body p-0">
                <div class="d-flex flex-column flex-shrink-0 p-3 off-bg-light pt-0 pb-0">
                    <!--
                    <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
                        <svg class="bi me-2" width="40" height="32"><use xlink:href="#bi-bootstrap"></use></svg>
                        <span class="fs-4">Sidebar</span>
                    </a>
                    <hr>
                    -->

                    <ul class="nav nav-pills flex-column mb-auto">
                        <li class="nav-item">
                            <a href="/" class="nav-link ${class2HomeActive}" off-aria-current="page">
                                <svg class="bi mb-1 me-2" width="16" height="16"><use xlink:href="#bi-home"></use></svg>
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="/rooms" class="nav-link ${class2RoomsActive}">
                                <svg class="bi mb-1 me-2" width="16" height="16"><use xlink:href="#bi-grid"></use></svg>
                                Rooms
                            </a>
                        </li>
                        <li>
                            <a href="/users" class="nav-link ${class2UsersActive}">
                                <svg class="bi mb-1 me-2" width="16" height="16"><use xlink:href="#bi-people-circle"></use></svg>
                                Users
                            </a>
                        </li>
                    </ul>
                    <hr />
                    <div class="dropdown">
                        <a href="#" class="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
                            <!--<img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2" />-->
                            <svg class="bi me-2" width="32" height="32"><use xlink:href="#bi-person-circle"></use></svg>
                            <strong class="text-truncate">${user.username}1111111111111111111111111</strong>
                        </a>
                        <ul class="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
                            <li><a class="dropdown-item" href="#">New project...</a></li>
                            <li><a class="dropdown-item" href="#">Settings</a></li>
                            <li><a class="dropdown-item" href="#">Profile</a></li>
                            <li><hr class="dropdown-divider" /></li>
                            <li><a class="dropdown-item" href="#" onClick=${logout}>Sign out</a></li>
                        </ul>
                    </div>
                    
                </div>


            </div>
        </div>
    `;
}
