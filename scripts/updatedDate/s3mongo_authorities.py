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
col = db["authorities"]
docs = col.find({})
docs2 = col.count_documents({}) # for length

s3 = boto3.client("s3", 
    region_name='us-east-1', 
    aws_access_key_id="AKIAXLIN4PPU6MFTVKEE", 
    aws_secret_access_key="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")

# print(s3.list_buckets())

total_authorities = docs2
print(total_authorities)
count = 0
print(count)

cap_date = datetime.datetime(2022, 11, 28)

for authority in docs:
    count = count + 1
    if 'updatedAt' in authority:
        print(authority['updatedAt'], " | ", cap_date)
        if (authority['updatedAt'] != None):
            print("******", authority['updatedAt']<cap_date)
        else:
            print("******", authority['updatedAt'])
        if authority['updatedAt'] == None or authority['updatedAt'] < cap_date:
            if 'logo' in authority:
                print(authority['logo']);
                if authority['logo'] != None:
                    print("***")
                    obj = s3.get_object(Bucket="s3-application", Key="dyn-res/authority/" + authority['logo'])
                    if 'LastModified' in obj:
                        print(obj['LastModified'])
                        print("*******chosen date = ", obj['LastModified'])
                        desiredProperty = db.authorities.find_one_and_update(filter={'url':authority['url']}, update={"$set": {'updatedAt':obj['LastModified']}}, return_document=ReturnDocument.AFTER)
                        print(desiredProperty['updatedAt'])
            else:
                print("No images found in this authority")
            end_time = datetime.datetime.now();
            time_taken = (end_time - start_time)
            print("took ", time_taken)
            print("--------------------", total_authorities, " - ", count)
