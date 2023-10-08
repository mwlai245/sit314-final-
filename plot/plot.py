import plotly
import plotly.graph_objs as go
from pymongo import MongoClient

# Mongo API key
Mongo_uri = 'mongodb+srv://mwlai:9.BHffsbb9uuEvf@cluster0.nuwovng.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp'

# Importing from the database name
db_name = 'test'

# Importing from the database collection "lights"
CollectionName = 'lights'

# Connecting to MongoDB
clientDB = MongoClient(Mongo_uri)
db = clientDB[db_name]
DBcollection = db[CollectionName]

# Initialize a list to store data traces for each light
light_traces = []

# Create a separate trace for each light
for light_id in range(200):
    light_data = list(DBcollection.find({'light_id': light_id}, {'_id': 0}).sort('timestamp', 1))
    room =[entry['room'] for entry in light_data]
    timestamps = [entry['timestamp'] for entry in light_data]
    light_intensity = [entry['light_intensity'] for entry in light_data]
    
    # Create a scatter plot trace for each light
    trace = go.Scatter(
        x=timestamps,
        y=light_intensity,
        mode='lines+markers',
        name=f'Light {light_id + 1}',
    )
    
    light_traces.append(trace)

# Define the layout of the plot
layout = go.Layout(
    title='Lighting Brightness Over Time for 500 Lights with Lines',
    xaxis=dict(title='Timestamp'),
    yaxis=dict(title='Intensity of Light for Lights (0-100)'),
)

# Create the figure with all the traces
fig = go.Figure(data=light_traces, layout=layout)

# Plotting the figure and saving it to an HTML file
plotly.offline.plot(fig, filename='smart_lighting_plot.html')

# Close the MongoDB connection
clientDB.close()
