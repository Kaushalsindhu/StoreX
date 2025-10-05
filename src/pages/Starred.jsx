import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import {account, database, Query} from "../appwriteConfig.js";
import { useRefresh } from '../contexts/RefreshContext.jsx';
import ListFile from "../components/ListFile"; 


function Starred() {
  const { fileRefreshFlag } = useRefresh();
  const [starredEntries, setStarredEntries] = useState([]);
  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
  const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

  useEffect(() => {
    const fetchStarredFiles = async () => {
      try {
        const currentUser = await account.get();
        const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal("userId", currentUser.$id)]);
        const userDoc = userDocs.documents[0];

        const starredFiles = userDoc?.starredFiles || [];
        const deletedFiles = userDoc?.deletedFiles || [];
        const filteredIds = starredFiles.filter(id => !deletedFiles.includes(id));

        if(filteredIds.length > 0) {
          const starredFilesDocs = await database.listDocuments(databaseId, fileCollectionId, [Query.equal("$id", filteredIds),]);
          const parsedEntries = starredFilesDocs.documents.map(doc => {
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
          setStarredEntries(parsedEntries);
        }
        else {
          setStarredEntries([]);
        }
      } catch (err) {
        toast.error('Error fetching starred files')
        console.error("Error fetching starred files:", err);
      } 
    };

    fetchStarredFiles();
  }, [fileRefreshFlag]);

  return (
    <div className="min-h-full px-4 py-1">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
        <h2 className="text-2xl text-gray-800 pt-2 font-semibold">Starred Files</h2>
      </div>
      <ListFile 
      viewMode="list"
      passedEntries={starredEntries}
      />
    </div>
  )
}

export default Starred