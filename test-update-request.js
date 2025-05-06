const axios = require('axios');

const template = "🐦 <b>Заказ обновлён!</b> 🔄\n\n📌 <b>{{title}}</b>\n\n📝 <i>Что изменилось:</i>\n{{changes}}\n\n📍 <i>Адрес:</i> {{address}}\n🏙️ <i>Город:</i> {{city_id}}\n\n🛠️ <i>Услуги:</i> {{services}}\n💰 <i>Бюджет:</i> {{budget}}\n📊 <i>Статус:</i> {{status}}\n\n⚠️ Проверьте обновлённые детали, если заказ всё ещё актуален!\n";

const dataWithArchivedStatus = {
  responses: [
    {
      message: "Я могу сделать",
      price_offer: 18000,
      request_id: {
        id: 123,
        title: "Съемка свадьбы",
        address: "ЗАГС",
        budget: 10000,
        description: "Съемка свадьбы",
        status: "archived",
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
          id: "99281932"
        }
      }
    }
  ],
  changes: {
    title: "Съемка свадьбы обновленная",
    address: "ЗАГС Центральный",
    budget: 15000,
    start: "2023-06-15T10:00:00",
    end: "2023-06-15T14:00:00",
    status: "archived",
    services: [{ services_id: { title: "Видеосъемка" } }, { services_id: { title: "Монтаж" } }, { services_id: { title: "Фотосъемка" } }],
    city_id: { title: "Нур-Султан" }
  },
  template: template
};

const dataWithNewStatus = {
  responses: [
    {
      message: "Я могу сделать",
      price_offer: 18000,
      request_id: {
        id: 456,
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
          id: "99281932"
        }
      }
    }
  ],
  changes: {
    title: "Съемка свадьбы обновленная",
    address: "ЗАГС Центральный",
    budget: 15000,
    start: "2023-06-15T10:00:00",
    end: "2023-06-15T14:00:00",
    status: "new",
    services: [{ services_id: { title: "Видеосъемка" } }, { services_id: { title: "Монтаж" } }, { services_id: { title: "Фотосъемка" } }],
    city_id: { title: "Нур-Султан" }
  },
  template: template
};

console.log('Testing with archived status:');
axios.post('http://localhost:3000/request-broadcast/update', dataWithArchivedStatus)
  .then(response => {
    console.log('Response (archived):', response.data);
    console.log('\nTesting with new status:');
    return axios.post('http://localhost:3000/request-broadcast/update', dataWithNewStatus);
  })
  .then(response => {
    console.log('Response (new):', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response ? error.response.data : error.message);
  });
