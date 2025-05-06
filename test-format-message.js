// This is a simple test script to manually verify the formatMessage functionality
// We'll simulate the behavior of the formatMessage method

// Test template with all the fields we want to test
const template = `
Status: {{status}}
Start: {{start}}
End: {{end}}
`;

// Test case 1: Status is 'new'
const dataWithNewStatus = {
  status: 'new',
  start: '2023-06-15T10:00:00',
  end: '2023-06-15T14:00:00',
};

// Test case 2: Status is 'archived'
const dataWithArchivedStatus = {
  status: 'archived',
  start: '2023-06-15T10:00:00',
  end: '2023-06-15T14:00:00',
};

// Simulate the formatMessage method
function formatMessage(template, data) {
  let message = template;

  // Special handling for status field
  if (data.status === 'new') {
    message = message.replace(/{{status}}/g, '');
  } else if (data.status === 'archived') {
    message = message.replace(/{{status}}/g, 'Архив');
  }

  Object.entries(data).forEach(([key, value]) => {
    if (key === 'status') {
      // Status is already handled above
      return;
    } else if (key === 'start' || key === 'end') {
      try {
        const date = new Date(String(value));
        const formattedDateTime = date.toLocaleString('ru-RU', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), formattedDateTime);
      } catch (error) {
        message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
    } else {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  });

  message = message.replace(/{{[^{}]+}}/g, '');

  return message;
}

// Call the formatMessage function
const resultNew = formatMessage(template, dataWithNewStatus);
const resultArchived = formatMessage(template, dataWithArchivedStatus);

console.log('Result with status=new:');
console.log(resultNew);
console.log('\nResult with status=archived:');
console.log(resultArchived);
