const axios = require('axios');

// Sample data based on the new structure
const data = {
  responses: [
    {
      message: "Я могу сделать",
      price_offer: 18000,
      request_id: {
        id: 123, // Adding id for the request
        title: "Съемка свадьбы",
        address: "ЗАГС",
        budget: 10000,
        description: "Съемка свадьбы",
        status: "new",
        services: [
          {
            services_id: {
              title: "Видеосъемка"
            }
          },
          {
            services_id: {
              title: "Монтаж"
            }
          }
        ],
        city_id: {
          title: "Алматы"
        }
      },
      performer_id: {
        user_id: {
          id: "99281932" // Telegram ID of the performer
        }
      }
    }
  ],
  changes: {
    description: "Съемка свадьбы",
    budget: 10000
  },
  template: "🐦 <b>Заказ обновлён!</b> 🔄\n\n📌 <b>{{title}}</b>\n\n📝 <i>Что изменилось:</i>\n{{changes}} <!-- сюда подставляйте список/таблицу изменённых полей -->\n\n📍 <i>Адрес:</i> {{address}}\n🏙️ <i>Город:</i> {{city_id}}\n\n🛠️ <i>Услуги:</i> {{services}}\n💰 <i>Бюджет:</i> {{budget}}\n\n⚠️ Проверьте обновлённые детали, если заказ всё ещё актуален!\n"
};

// Send the request to the update endpoint
axios.post('http://localhost:3000/request-broadcast/update/123', data)
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });
