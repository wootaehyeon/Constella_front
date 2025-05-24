import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await axios.get(`/api/diary-entries/${id}`);
        setEntry(res.data);
      } catch (err) {
        setError('일기 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (loading) return <div className="p-4 text-center">로딩 중...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!entry) return <div className="p-4 text-center text-gray-500">일기를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        className="mb-4 text-blue-500 hover:underline"
        onClick={() => navigate(-1)}
      >
        ← 돌아가기
      </button>

      <h1 className="text-3xl font-bold mb-2">{entry.title}</h1>
      <p className="text-gray-500 mb-6">{entry.date}</p>

      <div className="space-y-4 mb-6">
        {entry.contents.map((content, index) => (
          <p key={index} className="text-lg text-gray-800">
            {content}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entry.images.map((img, index) => (
          <img
            key={index}
            src={img.url}
            alt={`entry-${index}`}
            className="w-full h-auto rounded-lg shadow"
          />
        ))}
      </div>
    </div>
  );
};

export default CardDetail;
