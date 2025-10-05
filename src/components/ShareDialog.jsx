import { useState,useEffect } from 'react'
import {trackAccess, handleShare} from '../facilities/handleShare';
import {database,Query} from '../appwriteConfig.js'

function ShareDialog({setIsShareOpen,entry}) {

  const [shareEmail,setShareEmail] = useState('');
  const [accessList, setAccessList] = useState([]);
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    const fetchAccess = async () => {
        const res = await database.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
            [Query.equal('userId', entry.owner)]
        );
        setOwnerEmail(res.documents[0].email);
        const emails = await trackAccess(entry.$id);
        setAccessList(emails);
    };

    fetchAccess();
  },[entry.$id])

  
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Share File</h2>
            <button onClick={() => setIsShareOpen(false)} className="text-gray-600 hover:text-black">&times;</button>
        </div>

        <input
            type="email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            placeholder="Enter email to share with"
            className="w-full border px-3 py-2 rounded mb-3"
        />
        <button
            onClick={() => {
                handleShare(entry,shareEmail);
                setIsShareOpen(false);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
            Share
        </button>

        <div className="mt-5">
            <h3 className="font-medium mb-2">People with access:</h3>
            {accessList.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700">
                <li key={ownerEmail}>{ownerEmail}</li>
                {accessList.map(email => (
                <li key={email}>{email}</li>
                ))}
            </ul>
            ) : (
            <p className="text-sm text-gray-500">No one has access yet.</p>
            )}
        </div>
        </div>
    </div>
  )
}

export default ShareDialog