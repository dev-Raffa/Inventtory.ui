import { AuthLayout } from "@/app/layouts/auth/auth-layout"
import { Route } from "react-router"

export const PublicRouters = () => {
    return(
        <Route index element={<AuthLayout />}>

        </Route>
    )
}