import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, MapPin, BarChart3, LayoutDashboard, 
  ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Sliders, 
  LogOut, UserCircle, BookOpen, Menu, X,
  Clock, TrendingUp, DollarSign, Bookmark, CheckSquare, ClipboardCheck,
  Search, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const navLinks = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/products", icon: <Package size={20} />, label: "Products" },
    { to: "/warehouses", icon: <MapPin size={20} />, label: "Warehouses" },
    { to: "/stock-overview", icon: <BarChart3 size={20} />, label: "Stock Overview" },
    ...(isManagerOrAdmin ? [{ to: "/ledger", icon: <BookOpen size={20} />, label: "Stock Ledger" }] : []),
  ];

  const operationLinks = [
    { to: "/receipts", icon: <ArrowDownToLine size={20} />, label: "Receipts" },
    { to: "/deliveries", icon: <ArrowUpFromLine size={20} />, label: "Deliveries" },
    { to: "/transfers", icon: <ArrowRightLeft size={20} />, label: "Transfers" },
    { to: "/adjustments", icon: <Sliders size={20} />, label: "Adjustments" },
  ];

  const advancedLinks = [
    ...(isManagerOrAdmin ? [
      { to: "/aging", icon: <Clock size={20} />, label: "Stock Aging" },
      { to: "/forecasting", icon: <TrendingUp size={20} />, label: "Forecasting" },
      { to: "/valuation", icon: <DollarSign size={20} />, label: "Valuation" },
      { to: "/approvals", icon: <CheckSquare size={20} />, label: "Transfer Approvals" },
    ] : []),
    { to: "/reservations", icon: <Bookmark size={20} />, label: "Reservations" },
    { to: "/audits", icon: <ClipboardCheck size={20} />, label: "Smart Audits" },
  ];

  const NavItem = ({ to, icon, label }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-indigo-50 text-indigo-700 font-medium' 
            : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        {icon} {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 bg-white border-r flex flex-col z-30 transition-transform duration-300 ease-in-out`}>
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Package />
            StockSense
          </Link>
          <button className="md:hidden text-gray-500" onClick={() => setMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map(link => (
            <NavItem key={link.to} {...link} />
          ))}

          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Operations</p>
          </div>
          
          {operationLinks.map(link => (
            <NavItem key={link.to} {...link} />
          ))}

          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Advanced</p>
          </div>
          
          {advancedLinks.map(link => (
            <NavItem key={link.to} {...link} />
          ))}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <UserCircle size={32} className="text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        {/* Persistent Premium Header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-white px-4 sm:px-6 shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-gray-600 mr-2">
            <Menu size={20} />
          </button>
          
          <h1 className="truncate text-lg font-semibold text-gray-900 hidden md:block">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          
          <div className="md:hidden flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <Package size={20} />
            StockSense
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" aria-label="Search">
              <Search size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="ml-2 h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-indigo-700">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
