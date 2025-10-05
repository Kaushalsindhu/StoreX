import { useState, useRef, useEffect } from "react";
import {FaRegStar, FaUndo, FaStar, FaFolder, FaUserFriends, FaTrash, FaDownload, FaPencilAlt, FaEllipsisV } from "react-icons/fa";
import { toast } from 'react-toastify';
import {database,account,Query} from "../appwriteConfig.js"
import getFileIcon from '../facilities/getFileIcon.jsx'
import updateAccess from "../facilities/updateAccess.js";
import { moveToBin, permanentlyDeleteFile } from "../facilities/deleteFile.js";
import restoreFromBin from "../facilities/restore.js";
import {useRefresh} from '../contexts/RefreshContext.jsx'
import ShareDialog from "./shareDialog.jsx";

function ListRow({ entry, handleClick, formatBytes, isBinView, isSearchView}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const {toggleRefresh} = useRefresh();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    async function checkStarred() {
      try {
        const user = await account.get();
        const userDocs = await database.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
          [Query.equal("userId", user.$id)]
        );
        const userDoc = userDocs.documents[0];
        const starred = userDoc?.starredFiles || [];

        setIsStarred(starred.includes(entry.$id));
      } catch (err) {
        console.error("Failed to check starred status:", err);
      }
    }

    checkStarred();
  }, [entry.$id]);

  const getNameAndExt = (fullName) => {
    const lastDot = fullName.lastIndexOf(".");
    if (lastDot === -1) return [fullName, ""];
    return [fullName.slice(0, lastDot), fullName.slice(lastDot)];
  };

  const handleRename = async () => {
    const [oldNamePart, ext] = getNameAndExt(entry.displayName);
    const trimmedNewName = nameInput.trim();
    const newFullName = trimmedNewName + ext;
    if (trimmedNewName && newFullName !== entry.displayName) {
      try {
        const user = await account.get();
        const currentNames = entry.names ? JSON.parse(entry.names) : {};
        currentNames[user.$id] = newFullName;

        await database.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID,
          entry.$id,
          {names:JSON.stringify(currentNames)}
        );
        await updateAccess(entry.$id);
        toggleRefresh(); 
        toast.success('File renamed successfully!');
      } catch (error) {
        toast.error('File rename failed!')
        console.error("Rename failed:", error);
      }
    }
    setIsRenaming(false);
  }

  const handleDownload = async (entry) => {
    try {
      await updateAccess(entry.$id);
      toggleRefresh();
      const downloadUrl = `https://cloud.appwrite.io/v1/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${entry.fileId}/download?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}&mode=admin`;
      window.open(downloadUrl, '_blank');
    } catch (err) {
      toast.error('Rename failed!')
      console.error('Download failed:', err);
    }
  }

  const toggleStarred = async (entry) => {
    const currUser = await account.get();
    const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
    const userCollectionId = import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID;

    try {
      const userDocs = await database.listDocuments(databaseId, userCollectionId, [Query.equal("userId", currUser.$id)]);
      if (userDocs.total === 0) {
        toast.error("User document not found");
        return;
      }
      const userDoc = userDocs.documents[0];
      const starredFiles = userDoc.starredFiles || [];
      const fileId = entry.$id;

      let updatedStarredFiles;
      if (starredFiles.includes(fileId)) {
        updatedStarredFiles = starredFiles.filter(id => id !== fileId);
        setIsStarred(false);
      } else {
        updatedStarredFiles = [...starredFiles, fileId];
        setIsStarred(true);
      }

      await database.updateDocument(databaseId, userCollectionId, userDoc.$id, {
        starredFiles: updatedStarredFiles,
      });
    } catch (err) {
      toast.error("Error toggling Starred!");
      console.error("Error toggling isStarred:", err);
    }
  }

  const handleDragStart = (e) => {
    if (entry.type === "file") {
      e.dataTransfer.setData("fileId", entry.$id);
    }
  };

  const handleDragOver = (e) => {
    if (entry.type === "folder") {
      e.preventDefault(); // Necessary to allow dropping
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    if (!fileId || entry.type !== "folder") return;

    try {
      await database.updateDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_FILE_COLLECTION_ID,
        fileId,
        { parentId: entry.$id } // <-- change to folder ID
      );

      toast.success("File moved successfully!");
      toggleRefresh();
    } catch (err) {
      console.error("Move failed:", err);
      toast.error("Failed to move file.");
    }
  };

  return (
    <div
      draggable={entry.type === "file"}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => handleClick(entry)}
      className={`group flex items-center justify-between gap-4 py-2 md:px-5 lg:py-0 mb-2 bg-white ${isSearchView ? '' : 'border-b border-gray-200'} rounded-xl shadow-1 hover:shadow-sm transition-all duration-200 hover:bg-gray-200 cursor-pointer`}
    >
      {/* Left Section: Icon + Name */}
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="p-2 rounded-full bg-gray-100">
          {entry.type === 'folder' ? (
            <FaFolder className="text-yellow-500 text-lg" />
          ) : (
            getFileIcon(entry.displayName)
          )}
        </div>
        {isRenaming ? (
          <input
            ref={inputRef}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {if (e.key === "Enter") e.target.blur();}}
            className="border rounded px-2 py-1 text-sm max-w-[200px]"
          />
        ) : (
          <span className="font-normal text-gray-800 truncate max-w-[200px] md:max-w-xs">
            {entry.displayName}
          </span>
        )}
        {isStarred && (
          <span>
            <FaStar
                className="cursor-pointer mr-5 text-gray-700"
                title="Unstar"
              />
          </span>
        )}
      </div> 

      {/* Right Section: Size & Date */}
      {!isSearchView && (
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="group-hover:hidden md:flex items-center gap-6">
          {entry.type === 'file' && (<span className="whitespace-nowrap">{formatBytes(entry.size)}</span>)}
          <span className="whitespace-nowrap hidden md:inline">
            {new Date(entry.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div
          className="hidden group-hover:flex justify-end items-center gap-3 text-gray-600"
          onClick={(e) => e.stopPropagation()} // Prevent row click
        >
          {isBinView ? (
            <>
              <FaUndo
                className="mr-5 cursor-pointer text-md"
                title="Restore"
                onClick={async () => {
                  const success = await restoreFromBin(entry);
                  if (success) toggleRefresh();
                }}
              />

              <FaTrash
                className="cursor-pointer"
                title="Permanently Delete"
                onClick={async () => {
                  const success = await permanentlyDeleteFile(entry);
                  if (success) toggleRefresh();
                }}
              />
            </>

          ) : (
          
            <>
              {isStarred ? (
              <FaStar
                className="cursor-pointer mr-5 text-md"
                title="Unstar"
                onClick={() => {
                  setIsStarred(false);
                  toggleStarred(entry);  
                }}
              />
              ) : (
              <FaRegStar
                className="cursor-pointer mr-5 text-md"
                title="Star"
                onClick={() => {
                  setIsStarred(true)
                  toggleStarred(entry);
                }}
              />
              )}

              <FaUserFriends
                className="text-gray-600 text-md cursor-pointer mr-5 text-xl"
                title="Share"
                onClick={() => {
                  setIsShareOpen(true);
                }}
              />
              {isShareOpen && (
              <ShareDialog 
                setIsShareOpen={setIsShareOpen} 
                entry={entry}
              />
              )}

              <FaPencilAlt 
                className="cursor-pointer mr-5" 
                title="Rename"
                onClick={(e) => {
                  e.stopPropagation();
                  const [name] = getNameAndExt(entry.displayName);
                  setNameInput(name);
                  setIsRenaming(true);
                  setTimeout(() => {
                    if (inputRef.current) {
                      inputRef.current.focus();
                      inputRef.current.setSelectionRange(0, name.length);
                    }
                  }, 0);
                }}
              />

              {entry.type === 'file' && (
              <FaDownload
                onClick={() => handleDownload(entry)}
                className="text-gray-600 mr-5 cursor-pointer"
                title="Download"
              />
              )}

              <FaTrash 
                className="cursor-pointer"
                title="Delete"
                onClick={async () => {
                  const success = await moveToBin(entry.$id);
                  if (success) toggleRefresh();
                }} 
              /> 
            </>
          )}
        </div>

        <div className="lg:hidden relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="p-2 rounded-full hover:bg-gray-300"
            ref={buttonRef}
          >
            <FaEllipsisV />
          </button>

          {menuOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-28 bg-white shadow-lg border rounded z-50"
              ref={menuRef}
            >
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  setMenuOpen(false);
                  handleDownload(entry);
                }}
              >
                Download
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                onClick={async () => {
                  const success = await moveToBin(entry.$id);
                  if (success) toggleRefresh();
                }} 
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

export default ListRow
