import React from 'react';
import OperationForm from '../components/OperationForm';

const TransferForm = () => {
  return <OperationForm type="TRANSFER" title="Internal Transfer" backLink="/transfers" />;
};

export default TransferForm;
