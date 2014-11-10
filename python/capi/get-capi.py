from urllib2 import Request, urlopen
from boto.s3.connection import S3Connection
import json
import sysconfig
import os

page = 1
ugcStorage = []

access_key = os.environ['AWS_ACCESS_KEY_ID']
secret_key = os.environ['AWS_SECRET_ACCESS_KEY']
bucket = os.environ['S3_BUCKET_NAME']

s3_conn = S3Connection(access_key, secret_key)
upload_bucket_name = bucket

upload_bucket = s3_conn.get_bucket(upload_bucket_name)

def pullFeed(page):
    baseURL         = 'https://api.offerpop.com/v1/ugc/collections/'
    access_token    = '1dDCBwoeNf1QgZkYaZSwSvjik7lDKV'
    campaignId      = 6900
    page_size       = 100
    next            = False

    compiledRequest = baseURL + str(campaignId) + '/?access_token=' + access_token + '&page=' + str(page) + '&page_size=' + str(page_size) + '&social_platform=twitter%2Cinstagram%2Cvinetweet&order=random_sort&seed=7&approval_status=app&media_type=video%2Cimage'

    req             = Request(compiledRequest)
    res_body        = json.loads(urlopen(req).read().decode("utf-8"))
    filtered        = res_body['_embedded']['ugc:item']

    storeUGC(filtered)

    if res_body['_links']['next']['href'] is not None:
        page += 1
        print 'there is another page' + str(page)
        pullFeed(page)
    else:
        writeFile()

def storeUGC(data):
    for i in range(len(data)):
        content = data[i]['content']
        platform_data  = content['platform_data']

        if platform_data and content['media'] and platform_data['geo_data'] and platform_data['geo_data']['coordinates']:
            ugcStorage.append(data[i])

def writeFile():
    cleaned = json.dumps(ugcStorage, ensure_ascii=False)
    upload_s3('/roblum/response.json', cleaned, {'Content-Type' : 'application/json'})

def upload_s3(filename, data, headers):
     s3_file = upload_bucket.new_key(filename)
     s3_file.set_contents_from_string(data, headers)
     s3_file.set_acl('public-read')

pullFeed(page)

