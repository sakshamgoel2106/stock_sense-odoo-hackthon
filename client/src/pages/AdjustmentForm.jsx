import React from 'react';
import OperationForm from '../components/OperationForm';

const AdjustmentForm = () => {
  return <OperationForm type="ADJUSTMENT" title="Inventory Adjustment" backLink="/adjustments" />;
};

export default AdjustmentForm;
