// path: ./src/api/restaurant/controllers/restaurant.js

import {URLSearchParams} from "url";

const { createCoreController } = require('@strapi/strapi').factories;
const Paypal = require("paypal-rest-sdk")
const PORT = 8000


Paypal.configure({
  'mode' : 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENTID,
  'client_secret': process.env.PAYPAL_SECRET
})

// const createPayment = async (create_payment_json) => {
//   console.log(req.body)
//
//   Paypal.payment.create(create_payment_json, function (error, payment) {
//     if (error) {
//       console.log(error)
//     } else {
//       for (let i = 0; i < payment.links.length; i++ ){
//         if ( payment.links[i].rel === 'approval_url') {
//           res.redirect(payment.links[i].href)
//         }
//       }
//     }
//   });
//
// }





const createPayment = async (create_payment_json) => {
  return new Promise((resolve, reject) => {
    Paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.log(error.message);
      } else {
        for(let i =0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            resolve(payment.links[i].href)
          }
        }
      }
    })
  })
};

const executePayment = async (paymentID, execute_payment_json) => {
  return new Promise((resolve, reject) => {
    Paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
      if (error) {
        console.log(error);
        console.log(error.response.details)
        reject(error)
      } else {
        console.log(JSON.stringify(payment));
        resolve('Success');
      }
    })
  })
}



module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  // Method 1: Creating an entirely custom action




  async paypal(ctx) {
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  },

  async index(ctx) {
    ctx.send({
      message: 'ok'
    })
  },

  async success(ctx) {

   const url1 = new URL(`http://localhost:1337/${ctx.req.url}`)
    const payerId = url1.searchParams.get('PayerID')
    const paymentId = url1.searchParams.get('paymentId')

    console.log(payerId)
    console.log(paymentId)

    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": "25.00"
        }
    }]}

    await executePayment(paymentId, execute_payment_json);
    ctx.send('Success');

  },

  async cancel(ctx) {
    ctx.send("Cancelled");
  },

  async payment(ctx) {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
    },
      "redirect_urls": {
        "return_url": "http://localhost:3000/api/success",
        "cancel_url": "http://localhost:1337/api/orders/cancel"
      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": "Redhock Bar Soap",
            "sku": "001",
            "price": "25.00",
            "currency": "USD",
            "quantity": 1
          }]
        },
        "amount": {
          "currency": "USD",
          "total": "25.00"
        },
        "description": "Washing Bar soap"
      }]
  };
    const redirectUrl = await createPayment(create_payment_json);
    ctx.status = 308;
    ctx.send(redirectUrl);
  },
}));
