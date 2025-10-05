import {FaFolder, FaTrash, FaDownload, FaInfoCircle} from "react-icons/fa";
import { toast } from 'react-toastify';
import { useRefresh } from "../contexts/RefreshContext";
import getFileIcon from '../facilities/getFileIcon';
import { moveToBin } from "../facilities/deleteFile";

function GridCard({entry, handleClick, formatBytes }) {
  const {toggleRefresh} = useRefresh();
  
    const handleDownload = (entry) => {
      try {
        const downloadUrl = `https://cloud.appwrite.io/v1/storage/buckets/${import.meta.env.VITE_APPWRITE_BUCKET_ID}/files/${entry.fileId}/download?project=${import.meta.env.VITE_APPWRITE_PROJECT_ID}&mode=admin`;
        window.open(downloadUrl, '_blank');
      } catch (err) {
        toast.error('Download failed!');
        console.error('Download failed:', err);
      }
    }

  return (
    <div
      onClick={() => handleClick(entry)}
      className="group relative border border-gray-300 rounded-lg p-4 cursor-pointer hover:shadow-md transition duration-200 flex flex-col justify-between h-36"
    >
      <div className="flex items-center gap-3 mb-2">
        {entry.type === 'folder' ? (
          <FaFolder className="text-yellow-500 text-2xl" />
        ) : (
          getFileIcon(entry.displayName)
        )}
        <span className="font-semibold truncate">{entry.displayName}</span>
      </div>

      <div className="mt-auto">
        <div className="text-sm text-gray-500 flex justify-between group-hover:hidden">
          {entry.type === 'file' && <span>{formatBytes(entry.size)}</span>}
          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Hover Buttons */}
        <div
          className="hidden group-hover:flex justify-end gap-3 mt-2 font-3xl text-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          {
            entry.type === 'file' && (
              <FaDownload
                onClick={handleDownload}
                className="text-gray-600 hover:text-blue-600 cursor-pointer"
                title="Download"
              />
            )
          }
          
          <FaTrash
            onClick={async () => {
              const success = await moveToBin(entry.$id);
              if (success) toggleRefresh();
            }}
            className="text-gray-600 hover:text-red-600 cursor-pointer"
            title="Delete"
          />
        </div>
      </div>
    </div>
  )
}

export default GridCard