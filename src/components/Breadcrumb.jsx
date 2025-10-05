import { FaChevronRight } from 'react-icons/fa';

function Breadcrumb({ path , onClick}) {
  return (
    <nav className="text-gray-600 text-sm px-4 py-2">
      <ul className="flex items-center flex-wrap">
        {path.map((item, index) => (
          <li key={item.id} className="flex items-center text-2xl text-gray-700">
              {index < path.length - 1 ? (
                <span
                  onClick={() => onClick(index)}
                  className="cursor-pointer hover:underline"
                >
                  {item.name}
                </span>
              ) : (
                <span className="font-semibold">{item.name}</span>
              )}
              {index < path.length - 1 && (
                <FaChevronRight className="w-4 h-4 mx-2 text-gray-600" />
              )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Breadcrumb