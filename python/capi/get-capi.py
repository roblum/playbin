from urllib2 import Request, urlopen
import json

page = 1

def pullFeed(page):
    baseURL         = 'https://api.offerpop.com/v1/ugc/collections/'
    access_token    = '1dDCBwoeNf1QgZkYaZSwSvjik7lDKV'
    campaignId      = 6900
    page_size       = 10
    next            = False

    compiledRequest = baseURL + str(campaignId) + '/?access_token=' + access_token + '&page=' + str(page) + '&page_size=' + str(page_size) + '&social_platform=twitter%2Cinstagram%2Cvinetweet&order=random_sort&seed=7&approval_status=app&media_type=video%2Cimage'

    req             = Request(compiledRequest)
    res_body        = json.loads(urlopen(req).read().decode("utf-8"))
    filtered        = res_body['_embedded']['ugc:item']
    
    # print res_body['_embedded']['ugc:item']
    storeUGC(filtered)
    # writeFile(res_body)

    if res_body['_links']['next']['href'] is not None:
        page += 1
        print 'there is another page' + str(page)
        pullFeed(page)

def storeUGC(data):
    for i in range(len(data)):
        content = data[i]['content']
        platform_data  = content['platform_data']

        if platform_data and content['media'] and platform_data['geo_data'] and platform_data['geo_data']['coordinates']:
            print 'hello'

def writeFile(res):
    with open('capi/response.json', 'w') as outfile:
        outfile.write(res)

pullFeed(page)
