import { http } from '@google-cloud/functions-framework';
import { processHermesMessage } from './lib/hermes-handler';

/**
 * GCP Cloud Function entry point
 */
http('hermesBridge', async (req, res) => {
  // Handle CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).send({ content: 'No message provided.', type: 'text' });
      return;
    }

    const response = await processHermesMessage(message);
    res.status(200).send(response);
  } catch (error) {
    console.error('Error in Hermes Cloud Function:', error);
    res.status(500).send({
      content: 'SYSTEM ERROR: CLOUD FUNCTION FAILURE.',
      type: 'text'
    });
  }
});
