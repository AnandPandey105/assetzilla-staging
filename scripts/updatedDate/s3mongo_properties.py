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

# uri = "mongodb://realestate:rEAleStAtepWd91608102022@3.87.184.6:27017/realestate?authSource=realestate&w=1&tls=false"
uri = "mongodb://{}/{}".format(MONGO_HOST,MONGO_DB)
Client = MongoClient(uri)
db = Client["realestate"]
col = db["properties"]
docs = col.find({})

s3 = boto3.client("s3", 
    region_name='us-east-1', 
    aws_access_key_id="AKIAXLIN4PPU6MFTVKEE", 
    aws_secret_access_key="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")

# print(s3.list_buckets())

total_properties = 449
print(total_properties)
count = 0
print(count)

cap_date = datetime.datetime(2022, 11, 28)

for property in docs:
    count = count+  1
    if 'updatedAt' in property:
        print(property['updatedAt'], " | ", cap_date)
        if (property['updatedAt'] != None):
            print("******", property['updatedAt']<cap_date)
        else:
            print(property['updatedAt'])
        if property['updatedAt'] == None or property['updatedAt'] < cap_date:
            if 'images' in property:
                print(property['images']);
                if 'Properties' in property['images']:
                    if len(property['images']['Properties']) > 0:
                        print("***")
                        print(property['images']['Properties'][0])
                        obj = s3.get_object(Bucket="s3-application", Key="dyn-res/property/image/" + property['images']['Properties'][0])
                        if 'LastModified' in obj:
                            print(obj['LastModified'])
                            desiredProperty = db.properties.find_one_and_update(filter={'url':property['url']}, update={"$set": {'updatedAt':obj['LastModified']}}, return_document=ReturnDocument.AFTER)
                            print(desiredProperty['updatedAt'])
                    else:
                        print('Checking if it has images in the projects ... ')
                        if 'Projects' in property['images']:
                            if len(property['images']['Projects']) > 0:
                                print("*** found images in projects")
                                print(property['images']['Projects'][0])
                                obj = s3.get_object(Bucket="s3-application", Key="dyn-res/project/image/" + property['images']['Projects'][0])
                                if 'LastModified' in obj:
                                    print(obj['LastModified'])
                                    desiredProperty = db.properties.find_one_and_update(filter={'url':property['url']}, update={"$set": {'updatedAt':obj['LastModified']}}, return_document=ReturnDocument.AFTER)
                                    print(desiredProperty['updatedAt'])
                else:
                    print('Checking if it has images in the projects ... ')
                    if 'Projects' in property['images']:
                        if len(property['images']['Projects']) > 0:
                            print("*** found images in projects")
                            print(property['images']['Projects'][0])
                            obj = s3.get_object(Bucket="s3-application", Key="dyn-res/project/image/" + property['images']['Projects'][0])
                            if 'LastModified' in obj:
                                print(obj['LastModified'])
                                desiredProperty = db.properties.find_one_and_update(filter={'url':property['url']}, update={"$set": {'updatedAt':obj['LastModified']}}, return_document=ReturnDocument.AFTER)
                                print(desiredProperty['updatedAt'])
                # if 'Projects' in property['images']:
                #     print('Checking if it has images in the projects ... ')
                #     if 'Projects' in property['images']:
                #         if len(property['images']['Projects']) > 0:
                #             print("*** found images in projects")
                #             print(property['images']['Projects'][0])
                #             obj = s3.get_object(Bucket="s3-application", Key="dyn-res/project/image/" + property['images']['Projects'][0])
                #             if 'LastModified' in obj:
                #                 print(obj['LastModified'])
                #                 desiredProperty = db.properties.find_one_and_update(filter={'url':property['url']}, update={"$set": {'updatedAt':obj['LastModified']}}, return_document=ReturnDocument.AFTER)
                #                 print(desiredProperty['updatedAt'])
            end_time = datetime.datetime.now();
            time_taken = (end_time - start_time)
            print("took ", time_taken)
            print("--------------------", total_properties, " - ", count)
