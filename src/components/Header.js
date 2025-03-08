
import React from "react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-80 backdrop-blur-sm z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">
            <span className="text-purple-600">ie</span>VidMeet
          </h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Features</a></li>
            <li><a href="#" className="text-gray-700 hover:text-purple-600 font-medium">About</a></li>
            <li><a href="#" className="text-gray-700 hover:text-purple-600 font-medium">Support</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
