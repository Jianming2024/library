import {NavLink, Outlet} from "react-router";

export default function Home() {
    return <>
        <div className="min-h-screen bg-base-200">
            {/* Top bar */}
            <div className="navbar bg-base-100 border-b">
                <div className="mx-auto max-w-7xl w-full px-4">
                    <div className="flex items-center">
                        <span className="btn btn-ghost text-xl">📚 Library Admin</span>
                    </div>
                </div>
            </div>
             {/*Main grid: sidebar + content */}
            <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 p-4">
                {/* Sidebar */}
                <aside className="bg-base-100 border rounded-2xl p-3 h-fit sticky top-4">
                    <nav className="menu gap-1">
                        <li>
                            <NavLink
                                to="books"
                                className={({ isActive }) =>
                                    `btn btn-ghost justify-start ${isActive ? "btn-active" : ""}`
                                }
                            >
                            <span className="mr-2" aria-hidden>📘</span>
                                Books
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="authors"
                                className={({ isActive }) =>
                                    `btn btn-ghost justify-start ${isActive ? "btn-active" : ""}`
                                }
                            >
                            <span className="mr-2" aria-hidden> 🖋️</span>
                                Authors
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="genres"
                                className={({ isActive }) =>
                                    `btn btn-ghost justify-start ${isActive ? "btn-active" : ""}`
                                }
                            >
                            <span className="mr-2" aria-hidden>🏷️</span>
                                Genres
                            </NavLink>
                        </li>
                    </nav>
                </aside>
                {/* Routed content (HomeDashboard / Books / Authors / Genres) */}
                <main className="min-h-[70vh]">
                    <Outlet />
                </main>
            </div>
        </div>
    </>
}