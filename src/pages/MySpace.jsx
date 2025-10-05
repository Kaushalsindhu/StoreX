import { useLocation , useNavigate} from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import NewFolderInput from '../components/NewFolderInput';
import ListFile from '../components/ListFile.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import ToggleView from '../components/ToggleView.jsx';


function MySpace() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newFolderInputVisible, setNewFolderInputVisible] = useState(false);
  const [breadcrumbPath, setBreadcrumbPath] = useState([{ name: "My Space", id: "root" }]);
  const parentId = location.state?.parentId || "root";
  const [viewMode, setViewMode] = useState("list");
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    if (location.state?.createFolder) {
      setNewFolderInputVisible(true);
      const newState = { ...location.state };
      delete newState.createFolder;
      navigate(location.pathname, { replace: true, state: newState });
    }
    if (location.state?.breadcrumb) {
      setBreadcrumbPath(location.state.breadcrumb);
    } else {
      setBreadcrumbPath([{ name: "My Space", id: "root" }]);
    }
  }, [location.state, navigate, location.pathname]);

  const handleBreadcrumbClick = (index) => {
    const newPath = breadcrumbPath.slice(0, index + 1);
    const newParentId = newPath[index].id;

    setBreadcrumbPath(newPath);

    navigate('/myspace', {
      state: {
        parentId: newParentId,
        breadcrumb: newPath
      }
    });
  }; 

  return (
    <div className="min-h-full px-4 py-2">
      <div className="flex items-center justify-between border-b-2 border-gray-200">
        <Breadcrumb path={breadcrumbPath} onClick={handleBreadcrumbClick}/>
        <ToggleView viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {newFolderInputVisible && 
      <NewFolderInput 
      parentId={parentId} 
      onDone={() =>{
        setNewFolderInputVisible(false);
        setRefreshFlag(prev => !prev);
        }
      } />
      }

      <ListFile 
      parentId={parentId} 
      viewMode={viewMode} 
      refreshFlag={refreshFlag}
      />
    </div>
  )
}

export default MySpace