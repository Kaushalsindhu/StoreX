import {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import {account, database, Query} from '../appwriteConfig'
import { useRefresh } from '../contexts/RefreshContext';
import fileUpload from '../facilities/fileUpload';
import StorageCircle from '../components/StorageCircle'
import StorageGraph from './../components/StorageGraph';

function Home() {
  const [value, setValue] = useState(0);
  const [displayUnit, setDisplayUnit] = useState('GB');
  const [files,setFiles] = useState([])
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const navigate = useNavigate();
  const {toggleRefresh} = useRefresh();

  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;
  const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;

  useEffect(() => {
    const fetchData = async () => {
      const user = await account.get();
      const [userRes, fileDocs] = await Promise.all([
        database.listDocuments(databaseId, userCollectionId, [
          Query.equal('userId', user.$id)
        ]),
        database.listDocuments(databaseId, fileCollectionId, [
          Query.or([
            Query.equal('owner', user.$id),
            Query.contains('sharedWith', user.email)
          ])
        ])
      ]);

      const storage = userRes.documents[0].storage;
      setValue(storage);
      setDisplayUnit(storage < 1 ? 'MB' : 'GB');
      setFiles(fileDocs.documents);
      setLoading(false);
    }
    fetchData();
  },[])

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const success = await fileUpload(e, );
    navigate('/myspace')
    if (success) toggleRefresh();
  };

  return (
    <div 
      className="min-h-full px-4 py-1"
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
    >
      <div className="flex items-center justify-between px-6 py-2 border-b-2 border-gray-200">
        <h2 className="text-2xl text-gray-800 pt-2 font-semibold">Home</h2>
      </div>
      <div className='py-8 px-10 border-b-1 border-gray-300'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          {!loading && <StorageCircle used={value} total={1} unit={displayUnit}/>}
          {!loading && <StorageGraph files={files} />}
        </div>
      </div>
      {!loading && <div
        className={`mt-6 border-2 border-dashed rounded-lg p-15 text-center transition ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        {isDragging ? 'Release to upload files' : 'Drag & drop to upload files'}
      </div>}
    </div>
  )
}

export default Home