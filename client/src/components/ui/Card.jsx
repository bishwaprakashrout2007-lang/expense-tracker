import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 ${hover ? 'glass-card-hover' : ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
