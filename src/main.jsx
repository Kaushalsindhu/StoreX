import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import SharedWithMe from './pages/SharedWithMe.jsx'
import Recent from './pages/Recent.jsx'
import Bin from './pages/Bin.jsx'
import NotFound from './pages/NotFound.jsx'
import MySpace from './pages/MySpace.jsx'
import Starred from './pages/Starred.jsx'
import ProtectedRoute from './components/ProtectedRoute';
import NotLoggedIn from './pages/NotLoggedIn';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout/>}>
      <Route index element={<ProtectedRoute><Home/></ProtectedRoute>} />
      <Route path="myspace" element={<ProtectedRoute><MySpace /></ProtectedRoute>} />
      <Route path="shared" element={<ProtectedRoute><SharedWithMe /></ProtectedRoute>} />
      <Route path="recent" element={<ProtectedRoute><Recent /></ProtectedRoute>} />
      <Route path="starred" element={<ProtectedRoute><Starred /></ProtectedRoute>} />
      <Route path="bin" element={<ProtectedRoute><Bin /></ProtectedRoute>} />
      <Route path="not-logged-in" element={<NotLoggedIn />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)
