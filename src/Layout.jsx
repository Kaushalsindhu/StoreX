import './Layout.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { Outlet } from 'react-router-dom';
import { RefreshProvider } from './contexts/RefreshContext.jsx';


function Layout() {

  return (
    <RefreshProvider>
    <div className='h-screen flex flex-col bg-[#F8FAFD]'>
      <Header/>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar/>
        <div className="flex-1 min-h-0">
          <div className='h-full overflow-y-auto p-2 md:p-4 border-2 border-gray-200 bg-white rounded-4xl'>
            <Outlet/>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        />
    </div>
    </RefreshProvider>
  )
}

export default Layout
