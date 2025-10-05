import { useState, useEffect, useRef } from 'react';
import { FaFolder } from 'react-icons/fa';
import { toast } from 'react-toastify';
import createFolder from '../facilities/createFolder.js';

function NewFolderInput({parentId="root", onDone}) {
    const [folderName, setFolderName] = useState('New Folder');
    const wrapperRef = useRef(null);

    const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && folderName.trim()) {
      try {
        await createFolder(folderName.trim(), parentId);
        onDone();
      } catch (err) {
        toast.error('Failed to create folder!');
      }
    } else if (e.key === 'Escape') {
      onDone();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        onDone(); // cancel input
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex w-[97%] m-auto items-center px-4 justify-between rounded-xl bg-white border-b border-gray-200  mt-2">
  {/* Left Section: Folder Icon + Input */}
  <div className="flex items-center gap-4 overflow-hidden">
    <div className="p-2 rounded-full bg-gray-100">
      <FaFolder className="text-yellow-500 text-lg" />
    </div>
    <input
      type="text"
      value={folderName}
      onChange={(e) => setFolderName(e.target.value)}
      onKeyDown= {handleKeyDown}
      autoFocus
      className="font-normal text-gray-800 truncate max-w-[200px] md:max-w-xs bg-transparent outline-none border-b border-gray-300"
      placeholder="New Folder"
    />
  </div>
  </div>
  )
}

export default NewFolderInput