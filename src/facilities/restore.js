import { account, database, Query } from "../appwriteConfig.js";
import { toast } from "react-toastify";

export default async function restoreFromBin(entry){
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

    try{
        const currUser = await account.get();
        const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal("userId", currUser.$id)]);
        const userDoc = userDocs.documents[0];
        const updatedDeletedFiles = userDoc.deletedFiles.filter(id => id !== entry.$id);

        await database.updateDocument(databaseId, userCollectionId, userDoc.$id, {deletedFiles: updatedDeletedFiles});
        toast.success('File restored!')
        return true;
    } catch(err){
        toast.error('Error restoring file!');
        console.error('Error restoring file');
        return false;
    }
}