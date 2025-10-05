import { useState, useEffect, useRef } from 'react'
import { database, account, Query } from '../appwriteConfig';
import ListFile from './ListFile';

function SearchInput() {
  const [input, setInput] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef(null);

  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const fileCollectionId = import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID;

  useEffect(() => {
    if (input.trim() === '') {
      setFilteredFiles([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      const fetchFiles = async () => {
        try{
          const user = await account.get();
          const allFiles = await database.listDocuments(databaseId, fileCollectionId, [
            Query.or([Query.equal("owner", user.$id), Query.contains("sharedWith", user.email)])
          ]);
            
          const parsedEntries = allFiles.documents.map(doc => {
            let parsedNames = JSON.parse(doc.names);
            return {
              ...doc,
              displayName: parsedNames[user.$id] || "Untitled"
            };
          });

          const matched = parsedEntries.filter(file => file.displayName.toLowerCase().includes(input.toLowerCase()));
          setFilteredFiles(matched);
          setShowResults(true);
        }
        catch(err){
          console.error("Error in fetching files based on search input, ", err);
        }
      }
      fetchFiles()
    },100)
    
    return () => clearTimeout(timer);
  },[input])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div  ref={containerRef} className="relative w-full">
      <input
        type="text"
        placeholder="Search files..."
        className="w-full bg-gray-200 border border-gray-300 rounded-full px-4 py-2 pl-12 focus:bg-white focus:shadow-sm focus:outline-none"
        value = {input}
        onChange={(e) => setInput(e.target.value)}
      />
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ListFile
            viewmode = "list"
            passedEntries = {filteredFiles}
            isSearchView = {true}
          />
        </div>
      )}
    </div>
  )
}

export default SearchInput