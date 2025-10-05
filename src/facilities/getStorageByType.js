const mimeTypeCategories = {
  // Images
  "image/jpeg": "Images",
  "image/png": "Images",
  "image/gif": "Images",
  "image/jpg": "Images",
  
  // Documents
  "application/pdf": "PDF",
  "application/msword": "Docs",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Docs",
  
  // Presentations
  "application/vnd.ms-powerpoint": "Ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "Ppt",
  
  // Spreadsheets
  "application/vnd.ms-excel": "Spreadsheets",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Spreadsheets",
  
  // Videos
  "video/mp4": "Videos",
  "video/mpeg": "Videos",

  // Others
  "default": "Others"
};

function getCategory(mimeType) {
  return mimeTypeCategories[mimeType] || mimeTypeCategories.default;
}

export default function getStorageByType(files){
    const typeMap = {};
    files.forEach(file => {
        const type = getCategory(file.mimeType); 
        const sizeInMB = file.size / (1024 * 1024); 
        if (!typeMap[type]) typeMap[type] = 0;
        typeMap[type] += sizeInMB;
    });
    return Object.keys(typeMap).map(type => ({
        type,
        size: parseFloat(typeMap[type].toFixed(2))
    }));
}