import { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { database, account, Query } from '../appwriteConfig';
import { useRefresh } from '../contexts/RefreshContext';
import ListFile from '../components/ListFile'


function Recent() {
  const {fileRefreshFlag} = useRefresh();
  const [recentEntries, setRecentEntries] = useState([]);
  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
  const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

  useEffect(()=>{
    const fetchRecentEntries = async() => {
      try{
        const currUser = await account.get();
        const currUserId = currUser.$id;
        const userDoc = await database.listDocuments(databaseId, userCollectionId, [Query.equal('userId',currUserId)]);
        const deletedFileIds = userDoc.documents[0].deletedFiles || [];

        const fileRes = await database.listDocuments(databaseId, fileCollectionId, [
          Query.or([Query.equal("owner", currUserId),Query.contains("sharedWith", [currUserId])])
        ]);
        const visibleFiles = fileRes.documents.filter(file => !deletedFileIds.includes(file.$id));
        
        const sortedRecentFiles = visibleFiles.map(file => {
          let parsedAccess = JSON.parse(file.lastAccessedAt);
          if (Object.keys(parsedAccess).length === 0 || !parsedAccess.hasOwnProperty(currUserId)) return null;
          let parsedNames = JSON.parse(file.names || '{}');
          return {
            ...file,
            displayName: parsedNames[currUserId] || "Untitled",
            userLastAccessedAt: new Date(parsedAccess[currUserId])
          };
        })
        .filter(file => file !== null)
        .sort((a, b) => b.userLastAccessedAt - a.userLastAccessedAt); 

        setRecentEntries(sortedRecentFiles);
      } catch(err){
        toast.error('Error rendering recent files!')
        console.error("error rendering recent files",err);
      }
    }
    fetchRecentEntries();
  }, [fileRefreshFlag])

  return (
    <div className="min-h-full px-4 py-1">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
        <h2 className="text-2xl text-gray-800 pt-2 font-semibold">Recent Files</h2>
      </div>
      <ListFile 
        viewMode="list"
        passedEntries = {recentEntries}
      />
    </div>
  )
}

export default Recent