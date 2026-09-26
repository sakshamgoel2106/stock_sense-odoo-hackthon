import React from 'react';
import OperationForm from '../components/OperationForm';

const DeliveryForm = () => {
  return <OperationForm type="DELIVERY" title="Delivery Order" backLink="/deliveries" />;
};

export default DeliveryForm;
