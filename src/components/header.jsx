import React from 'react';

function Header() {
  return (
    <header className="bg-blue-950 w-full">
      <div className="px-4 mx-auto max-w-full sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex-shrink-0">
            <a href="#" title="" className="flex text-2xl mr-4">
              EchoScribe
            </a>
          </div>
          
          <a
            href="#"
            title=""
            className="items-center justify-center hidden px-4 py-3 ml-10 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md lg:inline-flex hover:bg-blue-700 focus:bg-blue-700"
            role="button"
          >
            Get started now
          </a>
          </nav>
      </div>
    </header>
    
  );
}

export default Header;
