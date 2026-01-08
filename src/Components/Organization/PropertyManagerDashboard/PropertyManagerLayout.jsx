import { Outlet } from 'react-router-dom';
import PropertyManagerSidebar from "./PropertyManagerSidebar.jsx"

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <PropertyManagerSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;