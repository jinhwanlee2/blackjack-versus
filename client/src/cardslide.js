import React from 'react';
import './cardslide.css';

function CardSlide({ card, alt }) {
  return (
    <img
      className="card-slide-enter"
      src={`./cards/${card}.png`}
      alt={alt}
    />
  );
}

export default CardSlide;