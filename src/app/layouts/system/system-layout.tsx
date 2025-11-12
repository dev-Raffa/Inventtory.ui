import { Outlet } from 'react-router';
import { SystemLayoutHeader } from './components/header/system-layout-header';
import { SystemLayoutSidebar } from './components/sidebar/system-layout-sidebar';

export const SystemLayout = () => {
  return (
    <>
      <SystemLayoutHeader />
      <section className="h-full flex gap-4 px-4">
        <SystemLayoutSidebar />
        <main className="flex-1 bg-white border-2 rounded-2xl p-6">
          <Outlet />
        </main>
      </section>
    </>
  );
};
