import { database, account, Query } from '../appwriteConfig.js';

async function getUserFiles(parentId = "root"){
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
    const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

    const user = await account.get();
    const userDocs = await database.listDocuments(databaseId,userCollectionId,[Query.equal('userId',user.$id)]);
    const databaseUser = userDocs.documents[0];

    const deletedFileIds = databaseUser.deletedFiles || [];

    const ownedFiles = await database.listDocuments(databaseId,fileCollectionId,[
        Query.equal('owner', user.$id),
        Query.equal('parentId', parentId) 
    ]);
    ownedFiles.documents = ownedFiles.documents.filter(file => !deletedFileIds.includes(file.$id));

    const sharedFiles = { documents: [] };
    if (parentId === 'root' && databaseUser.sharedFiles?.length > 0) {
    const sharedFilesPromise = await database.listDocuments(databaseId,fileCollectionId,[
        Query.equal('$id', databaseUser.sharedFiles),
    ]);
    sharedFiles.documents = sharedFilesPromise.documents.filter(file => !deletedFileIds.includes(file.$id));;
    }

    const allFiles = [...sharedFiles.documents,...ownedFiles.documents];
    return allFiles;
}
 
export default getUserFiles;