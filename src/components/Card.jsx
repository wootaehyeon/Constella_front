import React from 'react';

const Card = ({ entry, onClick }) => {
  return (
    <div
      onClick={() => onClick(entry.id)}
      className="w-64 h-80 bg-white shadow-md rounded-2xl p-4 cursor-pointer transition-transform hover:scale-105"
    >
      <h2 className="text-xl font-bold mb-2">{entry.title}</h2>
      <p className="text-gray-500">{entry.date}</p>
      <p className="mt-4 text-sm text-gray-700 truncate">
        {entry.contents[0] || '내용 없음'}
      </p>
    </div>
  );
};

export default Card;
