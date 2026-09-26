import React from 'react';
import OperationList from '../components/OperationList';

const Transfers = () => {
  return <OperationList title="Transfers" type="TRANSFER" newLink="/transfers/new" />;
};

export default Transfers;
