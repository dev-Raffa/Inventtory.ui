import { NavLink } from "react-router"
import { navLinks } from "./navlinks-siderbar"

export const SystemLayoutSidebar = ()=>{
    return(
        <aside className="w-2xs bg-white h-fit min-h-[calc(100vh-6.75rem)] p-6 rounded-2xl">
            <nav>
                <ul>
                    { navLinks.map((link)=>{
                        return(
                            <li key={link.href} className="mb-3 last:mb-0">
                                <NavLink 
                                  to={link.href} 
                                  className={({isActive}) => isActive ? 
                                  "flex items-center gap-4 text-green-950 py-2 px-3 rounded-[8px] bg-[#D1E5D9] font-medium" 
                                  : "flex items-center gap-4 text-green-950 py-2 px-3 rounded-[8px] font-medium hover:bg-[#D1E5D9]"}
                                >
                                    <link.icon className="w-5 h-5"/>
                                    {link.label}
                                </NavLink >
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </aside>
    )
}