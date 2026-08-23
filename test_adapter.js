const { startWhatsAppAdapter, destroyWhatsAppAdapter } = require('./whatsapp/src/adapter/index');

(async () => {
  try {
    console.log('Starting adapter...');
    const client = await startWhatsAppAdapter();
    console.log('Adapter started, client:', !!client);
    // Wait a bit to see if any immediate errors
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Stopping adapter...');
    await destroyWhatsAppAdapter();
    console.log('Adapter stopped.');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();