from urllib2 import Request, urlopen
import json

def pullFeed(page):
    baseURL = 'https://api.offerpop.com/v1/ugc/collections/'
    campaignId = 6900
    access_token = '1dDCBwoeNf1QgZkYaZSwSvjik7lDKV'
    next = False

    compiledRequest = baseURL + str(campaignId) + '/?access_token=' + access_token + '&page=' + str(page) + '&page_size=100&social_platform=twitter%2Cinstagram%2Cvinetweet&order=random_sort&seed=7&approval_status=app&media_type=video%2Cimage'

    req = Request(compiledRequest)
    res_body = json.loads(urlopen(req).read().decode("utf-8"))
    
    print res_body['_embedded']['ugc:item']
    # writeFile(res_body)

def storeUGC():


def writeFile(res):
    with open('capi/response.json', 'w') as outfile:
        outfile.write(res)

pullFeed(1)





    # opopMaps.mapManager.storeUGC(data['_embedded']['ugc:item']);

    #             if (data['_links'].next.href) {
    #                 var nextUrl = data['_links'].next.href
    #                     ,pageIndex = nextUrl.indexOf('&page=')
    #                     ,nextPage = nextUrl.slice(pageIndex + 6, nextUrl.length);

    #                     console.log(nextPage);
    #                     opopMaps.mapManager.pullFeed(nextPage);

    #             }

    #             if (ugcStorage['item1']){
    #                 var first = ugcStorage['item1']
    #                     ,coord = new google.maps.LatLng(first.latitude, first.longitude);

    #                     googleMap.panTo(coord);
    #             }

    #         });

    #     },
    #     storeUGC : function(data){
    #         console.log(data);

    #           for (var i in data){
    #             console.log(data[i])
    #             var content         = data[i].content
    #                 ,platform_data  = content.platform_data;

    #               if (platform_data &&
    #                   content.media &&
    #                   platform_data.geo_data &&
    #                   platform_data.geo_data.coordinates){

    #                       var geo_data  = platform_data.geo_data
    #                           ,images   = content.media.media_urls
    #                           ,network  = content.social_platform;

    #                           console.log(geo_data);

    #                       // Store necessary UGC data into geoStore object
    #                       var newUGC = {
    #                                   author          : content.author.username
    #                                   ,avatar         : content.author.profile.avatar
    #                                   ,caption        : content.text
    #                                   ,latitude       : geo_data.coordinates.latitude
    #                                   ,longitude      : geo_data.coordinates.longitude
    #                                   ,large_image    : images.large_image
    #                                   ,network        : network
    #                                   ,timestamp      : new Date(content.created_on).toDateString()
    #                                   ,platform_link  : platform_data.social_platform_original_url
    #                           // ,small_image : images.url
    #                       }

    #                       if (network === 'twitter') newUGC.platform_ref = content.platform_ref;

    #                       // Store geo data in global array
    #                       ugcStorage['item' + ugcCounter] = newUGC; // Store obj in global repo
    #                       // Store geo data in heatMap array
    #                       heatData.push(new google.maps.LatLng(geo_data.coordinates.latitude, geo_data.coordinates.longitude));

    #                       // Create marker with data
    #                       opopMaps.mapManager.createMarker(newUGC);
    #                       ugcCounter++;
    #           }
    #       }   
awq