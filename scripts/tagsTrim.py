from pprint import pprint
from pymongo import MongoClient
from pymongo import ReturnDocument
import boto3
import datetime

start_time = datetime.datetime.now()

# LOCAL SETUP
MONGO_HOST = "localhost:27017" 
MONGO_DB = "realestate"
MONGO_USER = ""
MONGO_PASS = ""

uri = "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false"
# uri = "mongodb://{}/{}".format(MONGO_HOST,MONGO_DB)
Client = MongoClient(uri)
db = Client["realestate"]
col = db["news"]
docs = col.find({})
docs_length = col.count_documents({})

count = 0
matchingTag = 0
for article in docs:
    if 'tags' in article:
        count += 1
        # print('--------------')
        oldtags = article['tags']
        newtags = []
        for oldtag in oldtags:
            newtags.append(oldtag.strip())
            # print(oldtag, oldtag.strip())
            if (len(oldtag) != len(oldtag.strip())):
                matchingTag += 1
        tagsToInsert = newtags
        desiredArticle = db.news.find_one_and_update(filter={'url':article['url']}, update={"$set": {'tags':tagsToInsert}}, return_document=ReturnDocument.AFTER)
        # print(desiredArticle['tags'], len(desiredArticle['tags']))
        print(count, matchingTag,docs_length)
print(count)
print(matchingTag)