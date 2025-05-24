import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../components/CardList.css';

const CardList = () => {
  const [entries, setEntries] = useState([]);
  const [searchParams] = useSearchParams();
  const country = searchParams.get('country');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/entries?country=${country}`)
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(console.error);
  }, [country]);

  return (
    <div className="card-list-wrapper">
      <h2>{country}의 여행 일기들</h2>
      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
      >
        {entries.map(entry => (
          <SwiperSlide key={entry.id}>
            <div
              className="card"
              onClick={() => navigate(`/cards/${entry.id}`)}
            >
              <h3>{entry.title}</h3>
              <p>{entry.date}</p>
              <img
                src={entry.images?.[0]?.url || '/default.jpg'}
                alt="대표 이미지"
                style={{ width: '100%', borderRadius: '12px' }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardList;
