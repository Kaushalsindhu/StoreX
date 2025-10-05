import {useState, useRef} from 'react'
import {Link, useNavigate,useLocation} from 'react-router-dom'
import {FaArrowRight, FaArrowLeft, FaHome, FaPlus, FaUserFriends, FaClock, FaStar, FaBars, FaTrash} from "react-icons/fa";
import { MdStorage } from "react-icons/md";
import {Menu,MenuItem,ListItemIcon,ListItemText} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import fileUpload from '../facilities/fileUpload.js';
import { useRefresh } from '../contexts/RefreshContext';
import logo from '../assets/logo.jpg';


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentParentId = location.state?.parentId || "root";
  const breadcrumbPath = location.state?.breadcrumb || [{ name: "My Space", id: "root" }];
  const [anchorEl, setAnchorEl] = useState(null);
  const fileInputRef = useRef();
  const { toggleRefresh } = useRefresh(); 
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleUploadFileClick = () => {
    const currentParentId = location.state?.parentId || "root";
    if (currentParentId === "root") {
      setSidebarOpen(false);
      navigate("/myspace");
    }
    fileInputRef.current.click();
    handleMenuClose();
  }; 

  const handleCreateFolderClick = () => {
    setSidebarOpen(false);
    handleMenuClose();
    navigate('/myspace', { state: { 
      createFolder: true,
      parentId: currentParentId,       
      breadcrumb: breadcrumbPath  
     } });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
    <button 
      onClick={() => setSidebarOpen(!sidebarOpen)} 
      className="lg:hidden fixed top-[65px] left-0 z-50 py-2 px-4 bg-gray-200 rounded-r-md shadow-md"
    >
      {sidebarOpen ? <FaArrowLeft size={20} /> : <FaArrowRight size={20} />}
    </button>

    <div style={{ height: 'calc(100vh - 65px)' }} className={`
          fixed top-[65px] left-0 z-40 lg:static lg:w-64 md:w-70 w-full md:border-r-1 lg:border-none border-gray-200 bg-[#F8FAFD] text-gray-700 flex-col p-5 shadow-lg 
          transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:flex
    `}>
      
      <nav className="flex flex-col h-full">
        <div className="flex items-center justify-center mb-5 md:hidden">
          <img src={logo} alt="logo" className="w-16 h-16 rounded-full" />
          <h1 className="text-xl font-semibold ml-2 text-gray-700">StorX</h1>
        </div>
        <br />
          <button 
            className="flex h-15 w-28 shadow-sm items-center bg-white text-gray-700 gap-3 hover:shadow-lg 
            transition-transform duration-200 px-5 py-1 rounded-md hover:outline-2 hover:outline-gray-700 cursor-pointer"
            onClick={handleMenuOpen}
          >
            <FaPlus />
            <span>New</span>
          </button>
          <br />

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleUploadFileClick}>
              <ListItemIcon>
                <UploadFileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Upload File" primaryTypographyProps={{ fontSize: 14, color: '#616161' }} />
            </MenuItem>

            <MenuItem onClick={handleCreateFolderClick}>
              <ListItemIcon>
                <CreateNewFolderIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Create Folder" primaryTypographyProps={{ fontSize: 14, color: '#616161' }} />
            </MenuItem>
          </Menu>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={async (e) => {
              const success = await fileUpload(e, currentParentId);
              if (success) toggleRefresh();
            }}
          />

          {[
            { to: "/", icon: <FaHome />, label: "Home" },
            { to: "/myspace", icon: <MdStorage />, label: "My Space" },
            { to: "/shared", icon: <FaUserFriends />, label: "Shared with me" },
            { to: "/recent", icon: <FaClock />, label: "Recent" },
            { to: "/starred", icon: <FaStar />, label: "Starred" },
            { to: "/bin", icon: <FaTrash />, label: "Bin" },
          ].map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={closeSidebar}
              className={`flex items-center gap-3 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md transition-colors duration-200 mt-1
              ${label === "Shared with me" || label === "Bin" ? "mt-5" : "mt-1"}`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </nav>
    </div>
    </>
  )
}

export default Sidebar