import React from 'react';
import OperationList from '../components/OperationList';

const Deliveries = () => {
  return <OperationList title="Deliveries" type="DELIVERY" newLink="/deliveries/new" />;
};

export default Deliveries;
