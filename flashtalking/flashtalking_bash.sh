# run nexgard python
python /home/ubuntu/analytics/engine/custom_ftp/photo_urls_v2.py

# run toyota python, saving to offerpop_photo_urls_toyota.csv
python /home/ubuntu/analytics/engine/custom_ftp/photo_urls_v2_toyota.py

#run put_photos
sftp -b /home/ubuntu/analytics/engine/custom_ftp/put_photos -i /home/ubuntu/.ssh/id_rsa -P 64420 offerpop@staging.flashtalking.net

#run put_photos_toyota
sftp -b /home/ubuntu/analytics/engine/custom_ftp/put_photos_toyota -i /home/ubuntu/.ssh/id_rsa -P 64420 offerpop@staging.flashtalking.net