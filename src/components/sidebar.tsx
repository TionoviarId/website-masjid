import { Home, User, Settings, Folder, Info } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="flex min-h-screen w-64 bg-[#006A71] text-white flex flex-col shadow-lg">
      <div className="p-6 text-2xl font-bold   border-gray-700">
        Agenda Ramadhan
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-4">
          <a href="http://localhost:3000/" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded cursor-pointer">
            <Home size={20} />
            
            <span>Home</span>
            
          </a>
          <li className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded cursor-pointer">
            <User size={20} />
            <a href="agenda">Agenda Imam dan Ceramah</a>
            <span></span>
          </li>
          <a href="countdown" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded cursor-pointer">
            <Folder size={20} />

            <span>Contdown Berbuka</span>
          </a>
          <a href="ramadhan_goals" className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded cursor-pointer">
            <Settings size={20} />
            <span>Ramadhan Goals</span>
          </a>
          <li className="flex items-center space-x-3 bg-[#48A6A7] hover:bg-gray-700 px-4 py-2 rounded cursor-pointer">
            <Info size={20} />
            <span>Logout</span>
          </li>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
