import React from 'react';
import OperationList from '../components/OperationList';

const Receipts = () => {
  return <OperationList title="Receipts" type="RECEIPT" newLink="/receipts/new" />;
};

export default Receipts;
