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
col = db["projects"]
docs = col.find({})

s3 = boto3.client("s3", 
    region_name='us-east-1', 
    aws_access_key_id="AKIAXLIN4PPU6MFTVKEE", 
    aws_secret_access_key="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")

# print(s3.list_buckets())

total_projects = 687
print(total_projects)
count = 0
print(count)

cap_date = datetime.datetime(2022, 12, 3)

for project in docs:
    count = count + 1
    if 'updatedAt' in project:
        print(project['updatedAt'], " | ", cap_date)
        if (project['updatedAt'] != None):
            print("******", project['updatedAt']<cap_date)
        else:
            print(project['updatedAt'])
        if project['updatedAt'] == None or project['updatedAt'] < cap_date:
            if 'images' in project:
                print(project['images']);
                if 'Projects' in project['images']:
                    if len(project['images']['Projects']) > 0:
                        print("***")
                        images = []
                        dateToPush = None
                        for img in project['images']['Projects']:
                            print(img)
                            try:
                                obj = s3.get_object(Bucket="s3-application", Key="dyn-res/project/image/" + img)
                                # print(obj)
                                if 'LastModified' in obj:
                                    print(obj['LastModified'])
                                    images.append(obj['LastModified'])
                            except ClientError as ex:
                                print(ex)
                        if (len(images) > 1):
                            images.sort()
                        print(images)
                        dateToPush = images[len(images)-1]
                        print("*******chosen date = ", dateToPush)
                        desiredProperty = db.projects.find_one_and_update(filter={'url':project['url']}, update={"$set": {'updatedAt':dateToPush}}, return_document=ReturnDocument.AFTER)
                        print(desiredProperty['updatedAt'])
                    else:
                        print("No images found in this project")
            end_time = datetime.datetime.now();
            time_taken = (end_time - start_time)
            print("took ", time_taken)
            print("--------------------", total_projects, " - ", count)
    else:
        print("No updatedAt field found in this project")
        if 'images' in project:
            print(project['images']);
            if 'Projects' in project['images']:
                if len(project['images']['Projects']) > 0:
                    print("***")
                    images = []
                    dateToPush = None
                    for img in project['images']['Projects']:
                        print(img)
                        try:
                            obj = s3.get_object(Bucket="s3-application", Key="dyn-res/project/image/" + img)
                            # print(obj)
                            if 'LastModified' in obj:
                                print(obj['LastModified'])
                                images.append(obj['LastModified'])
                        except ClientError as ex:
                            print(ex)
                    if (len(images) > 1):
                        images.sort()
                    print(images)
                    dateToPush = images[len(images)-1]
                    print("*******chosen date = ", dateToPush)
                    desiredProperty = db.projects.find_one_and_update(filter={'url':project['url']}, update={"$set": {'updatedAt':dateToPush}}, return_document=ReturnDocument.AFTER)
                    print(desiredProperty['updatedAt'])
        else:
            print("No images found in this project")
        end_time = datetime.datetime.now();
        time_taken = (end_time - start_time)
        print("took ", time_taken)
        print("--------------------", total_projects, " - ", count)

