from urllib2 import Request, urlopen

def pullFeed(page):
    baseURL = 'https://api.offerpop.com/v1/ugc/collections/'
    campaignId = 6900
    access_token = '1dDCBwoeNf1QgZkYaZSwSvjik7lDKV'
    next = False

    compiledRequest = baseURL + str(campaignId) + '/?access_token=' + access_token + '&page=' + str(page) + '&page_size=100&social_platform=twitter%2Cinstagram%2Cvinetweet&order=random_sort&seed=7&approval_status=app&media_type=video%2Cimage'

    req = Request(compiledRequest)
    res_body = urlopen(req).read()
    
    writeFile(res_body)

def writeFile(res):
    with open('capi/response.json', 'w') as outfile:
        outfile.write(res)

pullFeed(1)

