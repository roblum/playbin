from urllib2 import Request, urlopen
import json

def pullFeed():	
    requestString 	= 'http://api.wunderground.com/api/ed81498dd08a91f6/conditions/q/NY/New_York_City.json'

    req             = Request(requestString)
    res_body        = json.loads(urlopen(req).read().decode("utf-8"))
    
    print req
    print res_body
    writeFile(res_body);
    
def writeFile(res_body):
    cleaned = json.dumps(res_body, ensure_ascii=False)
    with open('response.json', 'w') as outfile:
        outfile.write(cleaned)

pullFeed();