import { account, storage, database, ID, Query} from '../appwriteConfig';
import { toast } from 'react-toastify';

const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

export const moveToBin = async (documentId) => {  
  try{
    const currUser = await account.get();
    const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal("userId", currUser.$id)]);
    const userDoc = userDocs.documents[0];
    const userDocId = userDoc.$id;
    const currentDeleted = userDoc.deletedFiles || [];
    const currentStarred = userDoc.starredFiles || [];
    const updatedDeleted = currentDeleted.includes(documentId)? currentDeleted: [...currentDeleted, documentId];
    const updatedStarred = currentStarred.filter((id) => id !== documentId);

    await database.updateDocument(databaseId, userCollectionId, userDocId, {deletedFiles: updatedDeleted,starredFiles: updatedStarred,});
    toast.success('File moved to bin');
    return true;
  }  
  catch (err){
    toast.error('Error deleting file!');
    console.error('Error deleting file: ', err);
    return false;
  }
}

export const permanentlyDeleteFile = async (entry) => {
  try {
    const currUser = await account.get();
    const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal("userId", currUser.$id)]);
    const userDoc = userDocs.documents[0];
    await storage.deleteFile(bucketId, entry.fileId);

    const updatedDeletedFiles = userDoc.deletedFiles.filter(id => id !== entry.$id);
    const updatedSharedFiles = userDoc.sharedFiles.filter(id => id !== entry.$id);
    const updatedStorage = userDoc.storage - (entry.size / (1024 ** 3));
    await database.updateDocument(databaseId, userCollectionId, userDoc.$id, {
      deletedFiles: updatedDeletedFiles,
      sharedFiles: updatedSharedFiles,
      storage: Math.max(updatedStorage, 0)
    });

    if (Array.isArray(entry.sharedWith) && entry.sharedWith.length === 0) {
      await database.deleteDocument(databaseId, fileCollectionId, entry.$id);
    } else {
      const updatedSharedWith = entry.sharedWith.filter(email => email !== userDoc.email);
      await database.updateDocument(databaseId, fileCollectionId, entry.$id,{sharedWith: updatedSharedWith})
      const namesObj = JSON.parse(entry.names);
      delete namesObj[currUser.$id];
      await database.updateDocument(databaseId, fileCollectionId, entry.$id, {names: JSON.stringify(namesObj)});
    }

    toast.success('File deleted permanently!');
    return true;

  } catch (error) {
    toast.error('Error deleting file!')
    console.error('Error deleting file or entry:', error);
    return false;
  }
};