import React from 'react';
import CardGrid from '../components/CardGrid';

const Dashboard = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Mes Cartes</h2>
      <CardGrid />
    </div>
  );
};

export default Dashboard;