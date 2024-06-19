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
datalist_old_1st_360_tags = [{"old":"Delhi Metro Rail Corporation (dmrc)", "new":"Delhi Metro Rail Corporation (DMRC)"}, {"old":"Real Estate Regulatory Authority (rera)", "new":"Delhi Metro Rail Corporation (DMRC)"}, {"old":"Delhi Development Authority(dda)", "new":"Delhi Development Authority (DDA)"}, {"old":"National Highways Authority Of India (nhai)", "new":"National Highways Authority Of India (NHAI)"}, {"old":"Bangalore Metro Rail Corporation Limited (bmrcl)", "new":"Bangalore Metro Rail Corporation Limited (BMRCL)"}, {"old":"National Capital Region Transport Corporation (ncrtc)", "new":"National Capital Region Transport Corporation (NCRTC)"}, {"old":"Delhi Ncr", "new":"Delhi NCR"}, {"old":"Delhi Development Authority (dda)", "new":"Delhi Development Authority (DDA)"}, {"old":"Maharashtra Real Estate Regulatory Authority (maharera)", "new":"Maharashtra Real Estate Regulatory Authority (MahaRERA)"}, {"old":"Rapid Rail Transit System (rrts)", "new":"Rapid Rail Transit System (RRTS)"}, {"old":"Mumbai Metropolitan Region (mmr)", "new":"Mumbai Metropolitan Region (MMR)"}, {"old":"Gautam Budh Nagar", "new":"Gautambudh Nagar"}, {"old":"Northern Peripheral Road", "new":"Northern Peripheral Road (NPR)"}, {"old":"Southern Peripheral Road", "new":"Southern Peripheral Road (SPR)"}, {"old":"Banglore", "new":"Bangalore"}, {"old":"Goods And Service Tax(gst)", "new":"Goods And Service Tax (GST)"}, {"old":"Mumbai Metropolitan Region", "new":"Mumbai Metropolitan Region (MMR)"}, {"old":"Nh-24", "new":"NH-24"}, {"old":" Delhi Development Authority (DDA)", "new":"Delhi Development Authority (DDA)"}, {"old":"Rera", "new":"Real Estate Regulatory Authority (RERA)"}, {"old":"Nh-1", "new":"NH-1"}, {"old":"Pradhan Mantri Awas Yojana (pmay)", "new":"Pradhan Mantri Awas Yojana (PMAY)"}, {"old":"Mg Road", "new":"MG Road"}, {"old":"Delhi-ncr", "new":"Delhi NCR"}, {"old":"Greater Noida Industrial Development Authority (gnida)", "new":"Greater Noida Industrial Development Authority (GNIDA)"}, {"old":"Cyber City", "new":"DLF Cyber City"}, {"old":"Floor-Area Ratio (FAR)", "new":"Floor Area Ratio (FAR)"}, {"old":" Dwarka Expressway", "new":"Dwarka Expressway"}, {"old":"National Buildings Construction Corporation Limited (NBCC)", "new":"National Buildings Construction Corporation (NBCC)"}, {"old":"MCG", "new":"Municipal Corporation of Gurgaon (MCG)"}, {"old":"RERA", "new":"Real Estate Regulatory Authority (RERA)"}, {"old":"Ghaziabad Development Authority (gda)", "new":"Ghaziabad Development Authority (GDA)"}, {"old":"Delhi-ghaziabad-meerut Rrts Corridor", "new":"Delhi-Ghaziabad-Meerut RRTS"}, {"old":"National Capital Region (ncr)", "new":"Delhi NCR"}, {"old":"Outer Ring Road (orr)", "new":"Outer Ring Road (ORR)"}, {"old":"Haryana Mass Rapid Transport Corporation (hmrtc)", "new":"Haryana Mass Rapid Transport Corporation (HMRTC)"}, {"old":"Baiyappanahalli-whitefield Line", "new":"Baiyappanahalli-Whitefield Line"}, {"old":"Maharera", "new":"MahaRERA"}, {"old":"Kempegowda International Airport", "new":"Kempegowda International Airport (KIA)"}, {"old":"Real Estate Regulation And Development Act", "new":"Real Estate Regulatory Authority (RERA)"}, {"old":"National Capital Region", "new":"Delhi NCR"}, {"old":"Credit Linked Subsidy Scheme (clss)", "new":"Credit Linked Subsidy Scheme (CLSS)"}, {"old":"Gt Road", "new":"GT Road"}, {"old":"Mumbai City", "new":"Mumbai"}, {"old":"National Building Construction Corporation (nbcc)", "new":"National Buildings Construction Corporation (NBCC)"}, {"old":"Apex Court", "new":"Supereme Court"}, {"old":"Uk", "new":"United Kingdom (UK)"}, {"old":"Us", "new":"United States of America (USA)"}, {"old":"Ncr", "new":"Delhi NCR"}, {"old":"Igi Airport", "new":"Indira Gandhi International Airport (IGI)"}, {"old":"Haryana Urban Development Authority (huda)", "new":"Haryana Urban Development Authority (HUDA)"}, {"old":"National Buildings Construction Corporation (nbcc)", "new":"National Buildings Construction Corporation (NBCC)"}, {"old":"Dlf Cyber City", "new":"DLF Cyber City"}, {"old":"Delhi-gurgaon Expressway", "new":"Delhi-Gurgaon Expressway"}, {"old":"Indira Gandhi International Airport", "new":"Indira Gandhi International Airport (IGI)"}, {"old":"Delhi-meerut Expressway", "new":"Delhi-Meerut Expressway"}, {"old":"Lucknow Metro Rail Corporation (lmrc)", "new":"Lucknow Metro Rail Corporation (LMRC)"}, {"old":"Urban Extension Road 2", "new":"Urban Extension Road 2 (UER2)"}]
datalist = [{"old":"IGI Airport", "new":"Indira Gandhi International Airport (IGI)"}, {"old":"Namma Metro","new":"Bangalore Metro"}, {"old":"Indira Gandhi International Airport (IGI)","new":"Indira Gandhi International Airport (IGI)"}, {"old":"MahaRERA","new":"Maharashtra Real Estate Regulatory Authority (MahaRERA)"}, {"old":"Goods And Service Tax (GST)","new":"Goods And Services Tax (GST)"}, {"old":"Bengaluru Metro","new":"Bangalore Metro"}, {"old":"Affordable Housing Scheme","new":"Affordable Housing"}, {"old":"Supereme Court","new":"Supreme Court of India"}, {"old":"National Highway Authority Of India (NHAI)","new":"National Highways Authority Of India (NHAI)"},{"old":"ISBT","new":"Inter State Bus Terminal (ISBT)"},{"old":"Urban Development Minister Venkaiah Naidu","new":"Union Urban Development Minister M Venkaiah Naidu"},{"old":" New Palam Vihar","new":"New Palam Vihar"},{"old":"National Real Estate Development Council(NREDC)","new":"National Real Estate Development Council (NAREDCO)"},{"old":"Noida Metro Rail Company (nmrc)","new":"Noida Metro Rail Company (NMRC)"},{"old":" Uttar Pradesh","new":"Uttar Pradesh"},{"old":"Urban Development Minister M Venkaiah Naidu","new":"Union Urban Development Minister M Venkaiah Naidu"},{"old":" Delhi High Court","new":"Delhi High Court"}]
# print(datalist)
# print(len(datalist))
count = 0
matchingTag = 0
for article in docs:
    count += 1
    if 'tags' in article:
        count += 1
        # print('--------------')
        oldtags = article['tags']
        # print(oldtags, len(oldtags))
        newtags = []
        lastMatch = matchingTag
        for oldtag in oldtags:
            count += 1
            for data in datalist:
                newtag = ''
                lastMatch = matchingTag
                if data['old'].strip() == oldtag.strip():
                    # print(data["old"].strip(), oldtag.strip())
                    matchingTag += 1
                    newtag = data['new']
                    newtags.append(newtag)
                    oldtags.remove(oldtag)
        # print(newtags, len(newtags))
        # print(oldtags, len(oldtags))
        tagsToInsert = oldtags + newtags
        if (lastMatch != matchingTag):
            print(tagsToInsert, len(tagsToInsert))
        desiredArticle = db.news.find_one_and_update(filter={'url':article['url']}, update={"$set": {'tags':tagsToInsert}}, return_document=ReturnDocument.AFTER)
        # print(desiredArticle['tags'], len(desiredArticle['tags']))
        print('-'*count)
print(count)
print(matchingTag)