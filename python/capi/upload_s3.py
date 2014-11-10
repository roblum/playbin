import sysconfig
import os
from boto.s3.connection import S3Connection

s3_conn = S3Connection(os.environ['AWS_ACCESS_KEY_ID'], os.environ['AWS_SECRET_ACCESS_KEY'])
upload_bucket_name = os.environ['S3_BUCKET_NAME']
upload_bucket = s3_conn.get_bucket(upload_bucket_name)

def upload_s3():
     print 's3 upload fired'
     file_title = '/roblum/response.json'

     s3_file = upload_bucket.new_key(file_title)
     s3_file.set_contents_from_filename('response.json')
     s3_file.set_acl('public-read')

upload_s3()
