import { useEffect, useState } from 'react'
import { account, database, Query } from '../appwriteConfig';
import ListFile from '../components/ListFile'
import { useRefresh } from '../contexts/RefreshContext';

function Bin() {
  const {fileRefreshFlag} = useRefresh();
  const [deletedEntries,setDeletedEntries] = useState([])
  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
  const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

  useEffect(() => {
    const fetchDeletedFiles = async () => {
      try{
        const currentUser = await account.get();
        const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal("userId", currentUser.$id)]);
        const userDoc = userDocs.documents[0];
        const deletedIds = userDoc?.deletedFiles || [];

        if(deletedIds.length > 0){
          const deletedFileDocs = await database.listDocuments(databaseId, fileCollectionId, [Query.equal("$id", deletedIds),]);
          const parsedEntries = deletedFileDocs.documents.map(doc => {
            let parsedNames = {};
            try {
              parsedNames = JSON.parse(doc.names || '{}');
            } catch (e) { 
              console.warn(`Error parsing names for ${doc.$id}`, e);
            }
            return {
              ...doc,
              displayName: parsedNames[currentUser.$id] || "Untitled"
            };
          });
          setDeletedEntries(parsedEntries);
        }
        else{
          setDeletedEntries([])
        }
      } 
      catch(err){
        console.error("Error fetching deleted files:", err);
      }
    }

    fetchDeletedFiles()
  }, [fileRefreshFlag])

  return (
    <div className="h-full px-4 py-1">  <py-3></py-3>
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
        <h2 className="text-2xl mt-2 text-gray-800 font-semibold">Bin</h2> 
      </div>
      <ListFile 
        viewMode = "list"
        passedEntries = {deletedEntries} 
        isBinView = {true}  
      />
    </div>
  )
}

export default Bin