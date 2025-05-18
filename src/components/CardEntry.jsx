import React from 'react';

const CardEntry = ({ name, number, imageUrl }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', width: '150px', textAlign: 'center' }}>
      <h4>Carte #{number}</h4>
      {imageUrl ? (
        <img src={imageUrl} alt={name} style={{ width: '100%', height: 'auto', borderRadius: '6px' }} />
      ) : (
        <p>{name}</p>
      )}
    </div>
  );
};

export default CardEntry;
