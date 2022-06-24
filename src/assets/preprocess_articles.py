import pandas
import json

data = pandas.read_csv("src/assets/articles_covid.csv", usecols=['date', 'time', 'source', 'title', 'categories', 'isDuplicate'])
data = data.drop(data[data.isDuplicate == True].index)
data = data.drop(columns=["isDuplicate"])
json_data = data.to_json(orient="table")
parsed_data = json.loads(json_data)

with open("src/assets/articles_covid.json", 'w') as json_file:
    json.dump(parsed_data, json_file)


