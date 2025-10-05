import React from 'react'
import {CircularProgressbar,buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function StorageCircle({used, total, unit}) {
    const percentage = (used / total) * 100;
    const displayedUsed = unit === 'MB'? (used * 1024).toFixed(2) : used.toFixed(2);

  return (
    <div className="w-[240px] h-[240px] flex flex-col items-center justify-center">
      <div className="w-full h-full"> 
        <svg style={{ height: 0 }}>
          <defs>
            <linearGradient id="progressGradient" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="#00c6ff" />  
              <stop offset="100%" stopColor="#7b2ff7" /> 
            </linearGradient>
          </defs>
        </svg>
        <CircularProgressbar
          value={percentage}
          text={`${percentage.toFixed(0)}%`}
          strokeWidth={6}
          styles={buildStyles({
            textSize: '13px',
            pathColor: 'url(#progressGradient)', 
            textColor: '#333',
            trailColor: '#eee',
          })}
        />
      </div>
      <div className='text-center mt-2'>
          {displayedUsed} {unit} / {total} GB 
      </div>
    </div>
  )
}

export default StorageCircle