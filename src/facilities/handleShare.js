import { database, Query, account} from "../appwriteConfig.js";
import { toast } from 'react-toastify';

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

async function trackAccess(entryId) {
  try {
    const document = await database.getDocument(databaseId, fileCollectionId, entryId);
    const sharedWith = document.sharedWith || [];    
    return sharedWith;
  } catch (error) {
    console.error("Error fetching document:", error);
    return [];
  }
}
 
async function handleShare(entry,email){
  try {
    const currentUser = await account.get();
    const document = await database.getDocument(databaseId, fileCollectionId, entry.$id);
    const sharedWith = document.sharedWith || [];
    if (sharedWith.includes(email)) console.log('Email already has access.');

    const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal('email', email)]);
    if (userDocs.total === 0) {
      console.log('No user found with this email.');
      return;
    }

    const userDoc = userDocs.documents[0];
    const currentNames = document.names ? JSON.parse(document.names) : {};
    currentNames[userDoc.userId] = currentNames[currentUser.$id];
    
    const updatedSharedWith = [...sharedWith, email];
    await database.updateDocument(databaseId, fileCollectionId, entry.$id, { 
      sharedWith: updatedSharedWith,
      names: JSON.stringify(currentNames)
    });
    console.log('Email added successfully!');

    const sharedFiles = userDoc.sharedFiles || [];
    if (!sharedFiles.includes(entry.$id)) {
      const updatedSharedFiles = [...sharedFiles, entry.$id];
      await database.updateDocument(databaseId, userCollectionId, userDoc.$id, {sharedFiles: updatedSharedFiles});
    }

    const updatedStorage = (userDoc.storage) + document.size / (1024 ** 3);
    await database.updateDocument(databaseId, userCollectionId, userDoc.$id, {storage: updatedStorage});
    toast.success('Share completed!');

  } catch (error) {
    toast.error('Error sharing file!');
    console.error("Error sharing document:", error);
  }
}

export {trackAccess,handleShare}