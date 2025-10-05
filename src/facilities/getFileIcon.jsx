import {
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaFileVideo,
  FaFileWord,
  FaFileCode,
  FaFilePowerpoint
} from "react-icons/fa";

function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();

  switch (ext) {
    case 'pdf':
      return <FaFilePdf className="text-red-500 text-lg" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FaFileImage className="text-blue-800 text-lg" />;
    case 'mp4':
    case 'mov':
    case 'avi':
      return <FaFileVideo className="text-purple-500 text-lg" />;
    case 'doc':
    case 'docx':
      return <FaFileWord className="text-blue-600 text-lg" />;
    case 'html':
    case 'js':
    case 'css':
      return <FaFileCode className="text-yellow-500 text-lg" />;
    case 'pptx':
      return <FaFilePowerpoint className="text-orange-500 text-lg" />
    default:
      return <FaFileAlt className="text-blue-500 text-lg" />;
  }
}

export default getFileIcon;