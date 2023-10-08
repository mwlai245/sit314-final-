const mqtt = require('mqtt');
const mongoose = require('mongoose');

const MQTT_BROKER_URL = 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = 'smart_lighting_building';

const MONGO_URI = 'mongodb+srv://mwlai:9.BHffsbb9uuEvf@cluster0.nuwovng.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp';
const ALERT_THRESHOLD = 80; // Set your desired threshold for light intensity

const MQTTClient = mqtt.connect(MQTT_BROKER_URL);

const smartLightingSchema = new mongoose.Schema({
  light_id: Number,
  room: Number,
  light_intensity: Number,
  timestamp: Date,
});

const Lighting = mongoose.model('lights', smartLightingSchema);

MQTTClient.on('connect', () => {
  console.log('Connected to MQTT broker');

  MQTTClient.subscribe(MQTT_TOPIC, (err) => {
    if (err) {
      console.error('Subscribing to MQTT topic UNSUCCESSFUL:', err);
    } else {
      console.log('Subscribed to MQTT topic:', MQTT_TOPIC, '  SUCCESSFUL');
    }
  });
});

MQTTClient.on('message', (topic, message) => {
  console.log('Received message on topic:', topic);
  console.log('Message:', message.toString());
  console.log('\n');

  const lightData = JSON.parse(message.toString());

  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  console.log('\n');
  db.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
  });

  db.once('open', () => {
    console.log('Connected to MongoDB');

    // Inserting the data into the 'lightings' collection
    Lighting.insertMany(lightData)
      .then((result) => {
        console.log(`Successfully Inserted ${result.length} rows of data into Lighting collection`);
        // Check for high-intensity lights and generate alerts
        for (const data of lightData) {
          if (data.light_intensity > ALERT_THRESHOLD) {
            console.log(`Alert: Light ${data.light_id} has high intensity (${data.light_intensity}). Lower the brightness or repair needed.`);
          }
        }

        // Close the MongoDB connection
        mongoose.connection.close();
      })
      .catch((err) => {
        console.error('Error inserting data into MongoDB:', err);
        // Close the MongoDB connection
        mongoose.connection.close();
      });
  });
});
