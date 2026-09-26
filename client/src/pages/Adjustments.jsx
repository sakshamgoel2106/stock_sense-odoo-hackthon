import React from 'react';
import OperationList from '../components/OperationList';

const Adjustments = () => {
  return <OperationList title="Adjustments" type="ADJUSTMENT" newLink="/adjustments/new" />;
};

export default Adjustments;
