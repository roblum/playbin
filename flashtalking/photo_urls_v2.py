import sys
DIR = '/home/ubuntu/analytics/engine/custom_ftp/'
#DIR = '/home/matthew/Downloads/'
sys.path.append('/home/ubuntu/analytics/engine')

from lib.sql_connect import DB

def dict_to_list(txt):
    t = eval(txt)
    if type(t) is list:
            pass
    elif type(t) is dict:
            t = [t]
    else:
            t = None
    return t

def make_link(base, meta):
    if base is None:
        return None
    elif meta is not None:
        for d in meta:
            if "large_filename" in d:
                return "%s/%s" % (base, d['large_filename'])
    return "%s/large.png" % base

if __name__=='__main__':

    result = DB(33620,"OfferpopProduction").query("""
    SELECT  map.content_id,
            media.base_url,
            media.metadata_json,
            map.approval_status,
                    subs.id as
            submission_id,
            c.social_platform,
                    DATE(c.created_on) as
            content_created_on_tmp,
                    DATE(subs.created_on) as
            submission_date_tmp
    FROM Core.hashtag_campaign_content_campaign_mapping map 
    INNER JOIN Core.hashtag_campaign_content c ON (map.content_id = c.id)
    INNER JOIN Core.hashtag_campaign_content_media media ON (c.media_id = media.id)
    INNER JOIN Core.submission as subs
            ON map.submission_id=subs.id
    where   map.campaign_id = 3715 
            and map.approval_status="app"
    order by c.created_on desc
    limit 15;

    """)

    if len(result)==0:
        print "no submitted entries"
        sys.exit()

    result['metadata_json'] = result['metadata_json']\
        .map(dict_to_list)
    result['content_link'] = result.apply(
        lambda x: make_link(x['base_url'],x['metadata_json']), axis=1)
    result['content_created_on_date'] = result['content_created_on_tmp']\
        .apply(lambda x: x.strftime('%Y-%m-%d'))
    result['submission_date'] = result['submission_date_tmp']\
        .apply(lambda x: x.strftime('%Y-%m-%d') if x!=None else None)
    result.reindex(columns=['content_id',
            'base_url',
	    'content_link',
            'approval_status',
            'submission_id',
            'social_platform',
            'content_created_on_date',
            'submission_date'])\
            .to_csv(DIR+'offerpop_photo_urls.csv', index=False)
    #print result




