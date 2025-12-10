import { NavLink } from 'react-router';
import { navLinks } from './navlinks-siderbar';
import { cn } from '@/lib/utils';

export const SystemLayoutSidebar = () => {
  return (
    <aside className="w-64 h-full min-h-[calc(100vh-6.75rem)] p-6 px-2 rounded-2xl hidden md:block border border-border/50 bg-sidebar">
      <nav>
        <ul className="space-y-2">
          {navLinks.map(({ href, icon, label }) => {
            return (
              <li key={href}>
                <NavLink
                  to={href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 py-2 px-3 rounded-md font-medium text-sm transition-all duration-200',

                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-primary hover:bg-accent hover:text-accent-foreground'
                    )
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
