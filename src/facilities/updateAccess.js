import { database, account } from "../appwriteConfig";

export default async function updateAccess(docId){
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
    const user = await account.get();
    const userId = user.$id;
    try{
        const doc = await database.getDocument(databaseId,fileCollectionId,docId);
        let lastAccessedAtObj = JSON.parse(doc.lastAccessedAt);
        lastAccessedAtObj[userId] = new Date().toISOString();
        await database.updateDocument(databaseId,fileCollectionId,docId,{lastAccessedAt: JSON.stringify(lastAccessedAtObj)});
    }
    catch(err){
        console.error('Error updating lastAccess:', err);
    }
}