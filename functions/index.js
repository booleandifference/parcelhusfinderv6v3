require("dotenv").config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

exports.getAudioSignedUrl = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      console.log('Starting to access Firebase Storage bucket...');

      const bucket = admin.storage().bucket('parcelhusfinderv6.appspot.com');
      const file = bucket.file('Audio/Parcelhus_history.wav');

      console.log('Checking if the file exists in Firebase Storage...');

      // Check if the file exists
      const [exists] = await file.exists();
      if (!exists) {
        console.error('File does not exist:', file.name);
        return res.status(404).send('File not found');
      }

      console.log('File exists, generating signed URL...');

      // Generate signed URL
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60, // URL expires in 1 hour
      });

      console.log('Signed URL generated successfully:', signedUrl);

      // Send the signed URL
      res.status(200).json({ signedUrl });
    } catch (error) {
      console.error('Error generating signed URL:', error); // Log the full error
      res.status(500).send('Error generating signed URL');
    }
  });
});


exports.generateImage = functions.https.onCall(async (data, context) => {
  const { prompt } = data;

  // Add the default string before the user's input
  const defaultPrompt = "a realistic architectural photography of a Danish parcelhus house";

  // Combine the default prompt with the user-provided input
  const fullPrompt = `${defaultPrompt} ${prompt}`;

  // Output the full prompt to the console for debugging
  console.log('Full Prompt being sent to Flux API:', fullPrompt);

  try {
    // Call the Flux API to generate the image with the combined prompt
    const fluxResponse = await axios.post(process.env.FLUX_API_ENDPOINT,
      { prompt: fullPrompt },  // Use fullPrompt here
      { headers: { "Authorization": `Bearer ${process.env.FLUX_API_KEY}` } },
    );
    
    // Assuming the response has the image URL
    const imageUrl = fluxResponse.data.image_url;

    return { imageUrl };
  } catch (error) {
    console.error('Error calling Flux API:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate image');
  }
});

