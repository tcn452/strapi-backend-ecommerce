module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/orders/paypal',
      handler: 'custom.paypal',
    },
    {
      method: 'GET',
      path: '/orders/success',
      handler: 'custom.success',
    },
    {
      method: 'GET',
      path: '/orders/cancel',
      handler: 'custom.cancel',
    },
    {
      method: 'GET',
      path: '/orders/payment',
      handler: 'custom.payment',
    }
  ],
};




