from urllib2 import Request, urlopen
request = Request("https://api.offerpop.com/v1/ugc/collections/6900/?access_token=1dDCBwoeNf1QgZkYaZSwSvjik7lDKV&page=1&page_size=100&social_platform=twitter%2Cinstagram%2Cvinetweet&claimed=yes&order=random_sort&seed=7&approval_status=app&media_type=video%2Cimage")
response_body = urlopen(request).read()
print response_body