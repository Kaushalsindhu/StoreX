import {account,storage,database,ID,Query,Permission} from '../appwriteConfig.js'
import { toast } from 'react-toastify';

async function fileUpload(e,parentId="root"){
  const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (!files || files.length === 0) return;

    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;
    const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;
    const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;

    try {
      const user = await account.get();
      const userRes = await database.listDocuments(databaseId, userCollectionId, [Query.equal('userId',user.$id)]);
      const userDoc = userRes.documents[0];

      await Promise.all(
        Array.from(files).map(async (file) => {
          const result = await storage.createFile(bucketId, ID.unique(), file, [
            Permission.read(`user:${user.$id}`),
            Permission.write(`user:${user.$id}`)
          ]);

          await database.createDocument(databaseId, fileCollectionId, ID.unique(), {
            fileId: result.$id,
            size: result.sizeOriginal,
            mimeType: result.mimeType,
            owner: user.$id,
            parentId: parentId,
            sharedWith: [],
            createdAt: new Date().toISOString(),
            type: 'file',
            names: JSON.stringify({ [user.$id]: result.name }),
            lastAccessedAt: JSON.stringify({})
          }, [
            Permission.read(`user:${user.$id}`),
            Permission.write(`user:${user.$id}`)
          ]);

          const updatedStorage = userDoc.storage + result.sizeOriginal / (1024 ** 3);
          userDoc.storage = updatedStorage; 
          await database.updateDocument(databaseId, userCollectionId, userDoc.$id, { storage: updatedStorage });
        })
      )
      toast.success('File Uploaded');
      return true;

    } catch (error) {
      toast.error('Upload error!');
      console.error('Upload failed:', error);
      alert('Upload failed.');
      return false; 
    }
}

export default fileUpload;