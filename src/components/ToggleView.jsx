import { FaThLarge, FaList, FaCheck } from "react-icons/fa";

function ToggleView({viewMode,setViewMode}) {
  return (
    <div className="flex h-auto border-2 border-gray-300 rounded-full overflow-hidden w-fit text-gray-700 text-sm">
      
      {/* List View */}
      <button
        onClick={() => setViewMode("list")}
        className={`cursor-pointer flex items-center gap-1 px-4 py-2.5 transition ${
          viewMode === "list" ? "bg-blue-200" : "bg-white"
        }`}
      >
        {viewMode === "list" && <FaCheck className="text-sm" />}
        <FaList />
      </button>

      {/* Grid View */}
      <button
        onClick={() => setViewMode("grid")}
        className={`cursor-pointer flex items-center gap-1 px-4 py-2.5 transition ${
          viewMode === "grid" ? "bg-blue-200" : "bg-white"
        }`}
      >
        {viewMode === "grid" && <FaCheck className="text-sm" />}
        <FaThLarge />
      </button>
    </div>
  )
}

export default ToggleView