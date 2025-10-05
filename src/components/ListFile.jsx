import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { account } from '../appwriteConfig.js';
import getUserFiles from '../facilities/getUserFiles.js';
import updateAccess from '../facilities/updateAccess.js';
import { useRefresh } from '../contexts/RefreshContext.jsx';
import GridCard from './GridCard.jsx';
import ListRow from './ListRow.jsx';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function ListFile({parentId="root", viewMode, refreshFlag, passedEntries, isBinView=false, isSearchView=false}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isWaiting, setIsWaiting] = useState(true);
  const [fetchedEntries, setFetchedEntries] = useState([]);
  const currentBreadcrumb = location.state?.breadcrumb || [{ name: "My Space", id: "root" }];
  const { fileRefreshFlag, toggleRefresh } = useRefresh();

  useEffect(() => {
    setIsWaiting(true); 
    const timer = setTimeout(() => {
      setIsWaiting(false);
    }, 3000);
    return () => clearTimeout(timer); 
  }, [parentId]);

  useEffect(() => {
    const fetchFiles = async () => {
    try { 
        const docs = await getUserFiles(parentId);
        const currentUser = await account.get();
        const userId = currentUser.$id;
        const parsedDocs = docs.map((doc) => {
          let parsedNames = {};
          try {
            parsedNames = JSON.parse(doc.names || '{}');
          } catch (e) {
            console.warn(`Failed to parse names for ${doc.$id}`, e);
          }
          return {
            ...doc,
            displayName: parsedNames[userId] || 'Untitled'
          };
        });
        setFetchedEntries(parsedDocs);
    } catch (err) {
        toast.error('Error fetching files!')
        console.error('Failed to fetch files', err);
    }
    };
    if (!passedEntries) fetchFiles(); 
    else setIsWaiting(false); 
  }
  , [parentId, refreshFlag, fileRefreshFlag]);

  const effectiveEntries = passedEntries ? passedEntries : fetchedEntries;

  const handleClick = async (entry) => { 
    
    if (entry.type === 'folder' && entry.$id !== parentId) {
      await updateAccess(entry.$id);
      toggleRefresh();
      navigate('/myspace', { state: { 
        parentId: entry.$id,
        folderName: entry.displayName,
        breadcrumb: [...currentBreadcrumb, { name: entry.displayName, id: entry.$id }]
      } });

    } else {
      await updateAccess(entry.$id);
      toggleRefresh();
      const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${entry.fileId}/view?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}&mode=admin`;
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className={`w-full ${isSearchView ? '' : 'min-h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] overflow-y-auto'}`}>
    {effectiveEntries.length === 0 ? (  
      isWaiting ? (
        <p className="text-gray-400 italic text-center">Loading...</p>
      ) : (
        <p className="text-gray-400 italic text-center">No files or folders found.</p>
      )
    ) : (
    <div className="relative overflow-visible">
    <div className={`min-w-full ${isSearchView? '' : "md:p-4"} ${viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4" : ""}`}>
      {effectiveEntries.map((entry) => (
        viewMode === "grid" ? (
          <GridCard
            key={entry.$id}
            entry = {entry}
            handleClick = {handleClick}
            formatBytes={formatBytes}
          />
        ) : (
          <ListRow 
            key={entry.$id}
            entry = {entry}
            handleClick = {handleClick}
            formatBytes={formatBytes}
            isBinView={isBinView}
            isSearchView = {isSearchView}
          />
        )
      ))}
    </div>
    </div>
    )
    }
    </div>
  )
}

export default ListFile