import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when navigating routes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  const toggleMobileOpen = () => {
    setMobileOpen(prev => !prev);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <Sidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <main className="main-content">
        <Header 
          collapsed={collapsed} 
          toggleCollapse={toggleCollapse}
          toggleMobileOpen={toggleMobileOpen}
        />
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

