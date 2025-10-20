import { Outlet } from "react-router"
import { SystemLayoutHeader } from "./components/header/system-layout-header"
import { SystemLayoutSidebar } from "./components/sidebar/system-layout-sidebar"

export const SystemLayout = ()=>{
    return(
        <>
            <SystemLayoutHeader />
            <section className="pt-2 h-full w-screen flex gap-6 px-4 sm:px-8">
                <SystemLayoutSidebar />
                <main className="w-full bg-white rounded-2xl p-6">
                    <Outlet />
                </main>
            </section>
        </>
    )
}