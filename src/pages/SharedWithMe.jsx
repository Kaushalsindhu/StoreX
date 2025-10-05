import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { account, database, Query } from '../appwriteConfig';
import ListFile from '../components/ListFile'

function SharedWithMe() {
  const [sharedEntries, setSharedEntries] = useState([]);
  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
  const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        const currentUser = await account.get();
        const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal("userId", currentUser.$id)]);
        const userDoc = userDocs.documents[0];

        const sharedFiles = userDoc?.sharedFiles || [];
        const deletedFiles = userDoc?.deletedFiles || [];
        const filteredIds = sharedFiles.filter(id => !deletedFiles.includes(id));

        if (filteredIds.length > 0) {
          const sharedFilesDocs = await database.listDocuments(databaseId, fileCollectionId, [Query.equal("$id", filteredIds),]);
          const parsedEntries = sharedFilesDocs.documents.map(doc => {
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
          setSharedEntries(parsedEntries);
        } 
        else {
          setSharedEntries([]);
        }
      } catch (err) {
        toast.error('Error fetching shared files!')
        console.error("Error fetching shared files:", err);
      }
    };
    fetchSharedFiles();
  }, []);

  return (
    <div className="min-h-full px-4 py-1">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-gray-200">
        <h2 className="text-2xl text-gray-800 pt-2 font-semibold">Shared With Me</h2>
      </div>
      <ListFile 
        viewMode="list"
        passedEntries = {sharedEntries}
      />
    </div>
  )
}

export default SharedWithMe