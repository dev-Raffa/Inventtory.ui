import { NavLink } from 'react-router';
import { navLinks } from './navlinks-siderbar';

export const SystemLayoutSidebar = () => {
  return (
    <aside className="w-2xs h-full min-h-[calc(100vh-6.75rem)] p-6 px-2 rounded-2xl">
      <nav>
        <ul>
          {navLinks.map(({ href, icon, label }) => {
            return (
              <li key={href} className="mb-3 last:mb-0">
                <NavLink
                  to={href}
                  className={({ isActive }) =>
                    isActive
                      ? 'flex items-center gap-4 text-secondary py-2 px-3 rounded-md bg-[#033116] font-semibold'
                      : 'flex items-center gap-4 text-green-950 py-2 px-3 rounded-md font-medium hover:bg-[#033116] hover:text-secondary'
                  }
                >
                  {icon} {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
