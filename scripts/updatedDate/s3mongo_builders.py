from pprint import pprint
from pymongo import MongoClient
from pymongo import ReturnDocument
import boto3
from botocore.exceptions import ClientError
import datetime

start_time = datetime.datetime.now()


# LOCAL SETUP
MONGO_HOST = "localhost:27017" 
MONGO_DB = "realestate"
MONGO_USER = ""
MONGO_PASS = ""

# uri = "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false"
uri = "mongodb://{}/{}".format(MONGO_HOST,MONGO_DB)
Client = MongoClient(uri)
db = Client["realestate"]
col = db["builders"]
docs = col.find({})
docs2 = col.count_documents({}) # for length

s3 = boto3.client("s3", 
    region_name='us-east-1', 
    aws_access_key_id="AKIAXLIN4PPU6MFTVKEE", 
    aws_secret_access_key="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")

# print(s3.list_buckets())

total_docs = docs2
print(total_docs)
count = 0
print(count)

cap_date = datetime.datetime(2022, 12, 1)

for builder in docs:
    count = count + 1
    if 'updatedAt' in builder:
        print(builder['updatedAt'], " | ", cap_date)
        if (builder['updatedAt'] != None):
            print("******", builder['updatedAt']<cap_date)
        else:
            print("******", builder['updatedAt'])
        if builder['updatedAt'] == None or builder['updatedAt'] < cap_date:
            if 'created' in builder:
                print("found created date in this builder = ", builder['created'])
                obj = s3.get_object(Bucket="s3-application", Key="dyn-res/builder/" + builder['logo'])
                if 'LastModified' in obj:
                    print(obj['LastModified'])
                    print("*******chosen date = ", obj['LastModified'])
                    desiredProperty = db.builders.find_one_and_update(filter={'url':builder['url']}, update={"$set": {'updatedAt':obj['LastModified']}}, return_document=ReturnDocument.AFTER)
                    print(desiredProperty['updatedAt'])
                
            elif 'logo' in builder:
                print(builder['logo']);
                if builder['logo'] != None and '.' in builder['logo']:
                    print("***")
                    obj = s3.get_object(Bucket="s3-application", Key="dyn-res/builder/" + builder['logo'])
                    if 'LastModified' in obj:
                        print(obj['LastModified'])
                        print("*******chosen date = ", obj['LastModified'])
                        desiredProperty = db.builders.find_one_and_update(filter={'url':builder['url']}, update={"$set": {'updatedAt':obj['LastModified']}}, return_document=ReturnDocument.AFTER)
                        print(desiredProperty['updatedAt'])
            else:
                print("No images/created date found in this builder")
            end_time = datetime.datetime.now();
            time_taken = (end_time - start_time)
            print("took ", time_taken)
            print("--------------------", total_docs, " - ", count)
