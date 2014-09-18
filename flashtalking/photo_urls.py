from lib.sql_connect import DB

DIR = '/home/ubuntu/analytics/engine/custom_ftp/'

result = DB(33620,"OfferpopProduction").query("""
select		p.Photo as
		photo_link,
			p.ShortUrl as
		bitly_link,
			p.ApprovalStatus as
		moderation_status,
			s.Valid as
		valid_submission,
			DATE(s.CreatedOn) as
		submission_date_tmp,
			DATE(p.CreatedOn) as
		photo_created_date_tmp,
			coalesce(p.Platform,'facebook') as
		platform,
			sc.Comment as
		moderation_comment
from OfferpopProduction.Photo as p
inner join OfferpopProduction.Submission as s
	on p.SubmissionId=s.SubmissionId
inner join OfferpopProduction.SubmissionComment sc
	on s.SubmissionId=sc.SubmissionId
where 	p.CouponId=606663
	and p.ApprovalStatus='approved'
group by p.SubmissionId
limit 10000000000
""")

result['submission_date'] = result['submission_date_tmp']\
				.apply(lambda x: x.strftime('%Y-%m-%d'))

result['photo_created_date'] = result['photo_created_date_tmp']\
                                .apply(lambda x: x.strftime('%Y-%m-%d'))


result.reindex(columns=['photo_link',
	'bitly_link',
	'moderation_status',
	'valid_submission',
	'submission_date',
	'photo_created_date',
	'platform',
	'moderation_comment'])\
	.to_csv(DIR+'offerpop_photo_urls.csv')



