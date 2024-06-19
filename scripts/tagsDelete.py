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

# print(s3.list_buckets())
datalist = ["Real Estate", "Residential Properties", "Real Estate Market", "Test", "Knight Frank India", "Testnew", "Test2", "Builders", "Jll", "Home Buyers", "Anarock Property Consultants", "Knight Frank", "Huda Sector", "Township", "Jll India"]

print(datalist)
print(len(datalist))
count = 0
matchingTag = 0
for article in docs:
    count += 1
    if 'tags' in article:
        count += 1
        print('--------------')
        oldtags = article['tags']
        newtags = []
        for oldtag in oldtags:
            count += 1
            for data in datalist:
                if data.strip() == oldtag.strip():
                    print("*********************")
                    print("****removing: ",data)
                    print("*********************")
                    matchingTag += 1
                    oldtags.remove(oldtag)
        # print(newtags, len(newtags))
        if (article['tags'] != oldtags):
            print("oldtags",oldtags, len(oldtags))
            tagsToInsert = oldtags + newtags
            print("tagsToInsert",tagsToInsert, len(tagsToInsert))
        tagsToInsert = oldtags
        desiredArticle = db.news.find_one_and_update(filter={'url':article['url']}, update={"$set": {'tags':tagsToInsert}}, return_document=ReturnDocument.AFTER)
        print(desiredArticle['tags'], len(desiredArticle['tags']))
        print('--------------')

print(count)
print(matchingTag)