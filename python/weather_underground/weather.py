from urllib2 import Request, urlopen
from icons import *
import json

weather = [];

def pullFeed():	
	baseURL 		= 'http://api.wunderground.com/api'
	apiKey 			= 'ed81498dd08a91f6'
	condition 		= 'hourly'
	state 			= 'NY'
	city 			= 'New_York_City'
	
	requestString 	= "%(baseURL)s/%(apiKey)s/%(condition)s/q/%(state)s/%(city)s.json" % locals()
	req             = Request(requestString)
	
	res_body        = json.loads(urlopen(req).read().decode("utf-8"))
	hourly 			= res_body['hourly_forecast']

	inc = 1
	
	while inc <= 8:
		weather.append({
				'time' 			: hourly[inc]['FCTTIME']['civil']
				,'temp' 		: hourly[inc]['temp']['english']
				,'condition' 	: hourly[inc]['wx']
			})
		inc += 1
		

	writeFile(weather, hourly)

def writeFile(res_body, hourly):
	data = json.dumps(res_body, ensure_ascii=False)
	partial = json.dumps(hourly, ensure_ascii=False)
	
	with open('response.json', 'w') as outfile:
		outfile.write(data)
	with open('hourly.json', 'w') as outfile:
		outfile.write(partial)

pullFeed();