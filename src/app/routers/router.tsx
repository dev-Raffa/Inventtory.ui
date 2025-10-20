import { Route, Routes } from "react-router"
import { AuthLayout } from "../layouts/auth/auth-layout"
import { SystemLayout } from "../layouts/system/system-layout"

export const AppRouters = ()=>{
    return(
        <Routes>
            <Route index element={<AuthLayout />}>

            </Route>
            <Route element={<SystemLayout />}>
                <Route path="/dashboard" element={<div>Dashboard</div>}>
                </Route>
                <Route path="/products" element={<div>Products</div>}>
                </Route>
                <Route path="/inventory" element={<div>Inventory</div>}>
                </Route>
                <Route path="/reports" element={<div>Reports</div>}>
                </Route>
            </Route>
        </Routes>
    )
}