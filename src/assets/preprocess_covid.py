import pandas
import json
import datetime

data = pandas.read_csv("src/assets/cas_covid.csv", delimiter=';', usecols=['Date de déclaration du cas', 'Cas confirmés'])
data['Date de déclaration du cas'] =  pandas.to_datetime(data['Date de déclaration du cas'], format='%Y-%m-%d %H:%M:%S')
end_date = pandas.to_datetime('2022-01-01 00:00:00', format='%Y-%m-%d %H:%M:%S')
mask = (data['Date de déclaration du cas'] < end_date)
data = data.loc[mask]
json_data = data.to_json(orient="table", index=False)
parsed_data = json.loads(json_data)
with open("src/assets/cas_covid.json", 'w') as json_file:
    json.dump(parsed_data, json_file)

