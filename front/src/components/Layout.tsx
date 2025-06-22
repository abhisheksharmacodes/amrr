import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Navigation */}
            <div className="flex-grow md:flex-grow-0">
              <div className="flex items-baseline space-x-2 sm:space-x-4">
                <Link
                  to="/"
                  className={`px-2 sm:px-3 py-2 rounded-md text-sm sm:text-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive('/')
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <span>Add Item</span>
                </Link>
                <Link
                  to="/view-items"
                  className={`px-2 sm:px-3 py-2 rounded-md text-sm sm:text-md font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive('/view-items')
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <span>View Items</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 