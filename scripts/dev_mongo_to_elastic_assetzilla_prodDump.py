from pprint import pprint
from pymongo import MongoClient
from elasticsearch import helpers, Elasticsearch
import ast
from bs4 import BeautifulSoup

# Replace these with your server details

# ATLAS
# MONGO_HOST = "realestatecluster.dzqjo.mongodb.net" 
# MONGO_DB = "realestate"
# MONGO_USER = "realestateuser"
# MONGO_PASS = "realestateuser"

# AWS 
# MONGO_HOST = "3.87.184.6" 
# MONGO_DB = "realestate"
# MONGO_USER = "realestate"
# MONGO_PASS = "Sv25074R7uR"

# uri = "mongodb+srv://{}:{}@{}/{}?authSource=admin".format(MONGO_USER,MONGO_PASS,MONGO_HOST,MONGO_DB)
# Client = MongoClient(uri)
# db = Client["realestate"]
# col = db["properties"]

# LOCAL SETUP
MONGO_HOST = "localhost:27017" 
MONGO_DB = "realestateProductionFeb20"
MONGO_USER = ""
MONGO_PASS = ""

uri = "mongodb://{}/{}".format(MONGO_HOST,MONGO_DB)
Client = MongoClient(uri)
db = Client["realestate"]
col = db["properties"]


docs = col.find({})

es = Elasticsearch()

c = 0
doc_list = []
seen = []
for doc in docs:
    del doc["_id"]
    if "name" in doc:
        if doc["name"] not in seen:
            doc["unique"] = 1
            seen.append(doc["name"])
    else:
        continue
    doc["doc_type"] = "property"
    doc_list.append(
        {"_source": doc, "_type": "entities", "_index": "assetzilla"})

mapping = {
    "settings": {
        "analysis": {
            "filter": {
            },
            "analyzer": {
                "white_space_analyzer": {
                    "tokenizer": "whitespace",
                    "filter": [
                        "lowercase"
                    ],
                    "char_filter": [
                        "only_space_char_filter"
                    ]
                },
                "lower_analyzer": {
                    "tokenizer": "whitespace",
                    "filter": [
                        "lowercase"
                    ],
                }
            },
            "char_filter": {
                "only_space_char_filter": {
                    "type": "pattern_replace",
                    "pattern": "[^a-zA-Z0-9\s]",
                    "replacement": " "
                },
                "trim_char_filter": {
                    "type": "pattern_replace",
                    "pattern": "[\s\t]+$",
                    "replacement": "$1"
                }
            }
        }

    },
    "mappings": {
        "entities": {
            "properties": {
                "name": {
                    "type": "text",
                    "fields": {
                        "raw": {
                            "type":  "keyword",
                            "index": "not_analyzed"
                        }
                    },
                    "analyzer":  "white_space_analyzer"
                },
                "project_status": {
                    "type":  "keyword",
                },
                "banks": {
                    "type":  "keyword",
                },
                "city": {
                    "type": "keyword",
                },
                "subcity": {
                    "type": "keyword",
                },
                "state": {
                    "type": "keyword",
                },
                "district": {
                    "type": "keyword",
                },
                "property_type": {
                    "type": "keyword",
                },
                "tags": {
                    "type": "keyword",
                },
                "gdp": {
                    "type": "long",
                },
                "capital_income": {
                    "type": "long",
                },
                "population": {
                    "type": "long",
                },
                "facing": {
                    "type": "keyword",
                },  
                "area.area": {
                    "type": "double",
                },                
                "bhk_space": {
                    "type": "keyword",
                },
                "url":{
                    "type":"string",
                    "index":"not_analyzed"
                },
                "builder": {
                    "type": "keyword",
                    "index":"not_analyzed"
                },
                "location": {
                    "properties": {
                        "location" : {
                            "properties": {
                                "lat": {
                                   "type": "float" 
                                },
                                "lng": {
                                   "type": "float" 
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}

es.indices.create(index='assetzilla', body=mapping)
print("# Mapping Loaded")
helpers.bulk(es, doc_list)
print("# Properties Loaded")
col = db["builders"]

docs = col.find({})
doc_list = []
seen = []
for doc in docs:
    del doc["_id"]
    if doc["name"] not in seen:
        doc["unique"] = 1
        seen.append(doc["name"])
    doc["doc_type"] = "builder"
    doc_list.append(
        {"_source": doc, "_type": "entities", "_index": "assetzilla"})
helpers.bulk(es, doc_list)
print("# Builders Loaded")


col = db["projects"]

docs = col.find({})
# print("####DOCS : ", docs)
doc_list = []
seen = []
for doc in docs:
    del doc["_id"]
    if doc["name"] not in seen:
        doc["unique"] = 1
        seen.append(doc["name"])
    doc["doc_type"] = "project"
    doc_list.append(
        {"_source": doc, "_type": "entities", "_index": "assetzilla"})
helpers.bulk(es, doc_list)
print("# Projects Loaded")


col = db["banks"]

docs = col.find({})
doc_list = []
seen = []
for doc in docs:
    del doc["_id"]
    doc["unique"] = 1
    doc["doc_type"] = "bank"
    doc_list.append(
        {"_source": doc, "_type": "entities", "_index": "assetzilla"})
helpers.bulk(es, doc_list)
print("# Bank Loaded")

locations = [["subcity", "subcities"], ["city", "cities"],
             ["district", "districts"], ["state", "states"]]
seen = []
for location in locations:
    doc_list = []
    docs = db[location[1]].find({})
    for doc in docs:
        if "details" in doc:
            doc["location_details"] = doc["details"]
            del doc["details"]
        del doc["_id"]
        doc["unique"] = 1
        doc["doc_type"] = "location"
        doc["location_type"] = location[0]
        doc_list.append(
            {"_source": doc, "_type": "entities", "_index": "assetzilla"})
    helpers.bulk(es, doc_list)
print("# Locations Loaded")


col = db["news"]

docs = col.find({})
doc_list = []
seen = []
for doc in docs:
    del doc["_id"]
    data = {}
    if "tags" in doc:
        data["tags"] = doc["tags"]
    if "images" in doc:
        data["news_banner"] = doc["images"]
    if "id" in doc:
        data["id"] = doc["id"]
    if "heading" in doc:
        data["heading"] = doc["heading"]
        if len(data["heading"]) > 120:
            data["heading"] = data["heading"][:120]+"..."
    if "updated" in doc:
        data["updated"] = doc["updated"]
    if "publish_date" in doc:
        data["publish_date"] = doc["publish_date"]
    if "link" in doc:
        data["link"] = doc["link"]
    if "link_name" in doc:
        data["link_name"] = doc["link_name"]
    if "views" in doc:
        data["views"] = doc["views"]
    if "is_live" in doc:
        data["is_live"] = doc["is_live"]
    if "content" in doc:
        soup = BeautifulSoup(doc["content"],features="html.parser")
        data["content"] = soup.getText()
        if len(data["content"]) > 200:
            data["content"] = data["content"][:200]+"..."
    data["url"] = doc["url"]
    data["doc_type"] = "news"
    doc_list.append(
        {"_source": data, "_type": "entities", "_index": "assetzilla"})
helpers.bulk(es, doc_list)
print("# News Loaded")

col = db["authorities"]

docs = col.find({})
doc_list = []
seen = []
for doc in docs:
    del doc["_id"]
    if doc["name"] not in seen:
        doc["unique"] = 1
        seen.append(doc["name"])
    doc["doc_type"] = "authority"
    doc_list.append(
        {"_source": doc, "_type": "entities", "_index": "assetzilla"})
helpers.bulk(es, doc_list)
print("# Authorities Loaded")
