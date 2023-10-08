const mqtt = require('mqtt');

const MQTT_BROKER_URL = 'mqtt://broker.hivemq.com:1883'; // HiveMQ public broker
const MQTT_TOPIC = 'smart_lighting_building';
const MQTT_BASE_TOPIC = 'smart_lighting_building'; // Base MQTT topic
const ALERT_THRESHOLD = 80; // Set your desired threshold for light intensity

function getLightIntensity() {
  return Math.floor(Math.random() * 101); // Generates a random integer between 0 and 100
}

function getTimestamp() {
  const nowTime = new Date();
  const randomMillis = Math.floor(Math.random() * 60 * 60 * 1000);
  const randomTime = new Date(nowTime - randomMillis);
  return randomTime;
}

function getRoom() {
  return Math.floor(Math.random() * 5); // Generates a random integer between 0 and 4
}

function generateData(NoLights) {
  const data = [];
  for (let i = 0; i < NoLights; i++) {
    const light_id = i;
    const room = getRoom();
    const light_intensity = getLightIntensity();
    const timestamp = getTimestamp();
    data.push({ light_id, room, timestamp, light_intensity });
  }
  return data;
}

const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker successfully');

  const randData = generateData(200);

  // Check for high-intensity lights and generate alerts
  for (const data of randData) {
    if (data.light_intensity > ALERT_THRESHOLD) {
      console.log(`Alert: Light ${data.light_id} has high intensity (${data.light_intensity}). Lower the brightness or repair needed.`);
    }
  }

  mqttClient.publish(MQTT_TOPIC, JSON.stringify(randData), (err) => {
    if (err) {
      console.error('Error publishing data: ', err);
    } else {
      console.log('Data successfully published to MQTT topic:', MQTT_TOPIC);
    }

    // Publish light intensity data to MQTT topics
    for (const data of randData) {
      const topic = `${MQTT_BASE_TOPIC}/${data.light_id}/${data.room}/intensity`;
      mqttClient.publish(topic, data.light_intensity.toString(), (err) => {
        if (err) {
          console.error('Error publishing data: ', err);
        } else {
          console.log(`Data successfully published to MQTT topic: ${topic}`);
        }
      });

      // Check for high-intensity lights and generate alerts
      if (data.light_intensity > ALERT_THRESHOLD) {
        console.log(`Alert: Light ${data.light_id} in room ${data.room} has high intensity (${data.light_intensity}). Lower the brightness or repair needed.`);
      }
    }

    mqttClient.end();
  });
});