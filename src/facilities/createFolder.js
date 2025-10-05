import {account, database, ID, Permission} from '../appwriteConfig.js';
import { toast } from 'react-toastify';

async function createFolder(name, parentId = "root"){
    try {
        const user = await account.get();

        const result = await database.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID,
        ID.unique(),
        {
            fileId: null,
            size: 0,
            mimeType: null,
            owner: user.$id,
            parentId: parentId,
            type: 'folder',
            sharedWith: [],
            createdAt: new Date().toISOString(),
            names:JSON.stringify({[user.$id]:name}),
            lastAccessedAt: JSON.stringify({})
        },
        [
            Permission.read(`user:${user.$id}`),
            Permission.write(`user:${user.$id}`)
        ]
        );

        toast.success('Folder created successfully!');
        return result;

    } catch(error){
        toast.error('Error creating folder!');
        console.error('Error creating folder:', error);
        throw error;
    }
}

export default createFolder;