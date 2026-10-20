"""
S3-compatible storage backend for ticket attachments.

Defaults to Supabase's S3 gateway, but works with any endpoint exposing the
S3 API (AWS S3, MinIO, R2, ...). Configure credentials via the SUPPORT_TICKET
settings dict (see conf.py), e.g.::

    SUPPORT_TICKET = {
        'S3_ENDPOINT_URL': 'https://<ref>.supabase.co/storage/v1/s3',
        'S3_ACCESS_KEY_ID': '...',
        'S3_SECRET_ACCESS_KEY': '...',
        'S3_REGION': 'auto',
        'S3_BUCKET': 'tickets',
        ...
    }

Activate it in Django's STORAGES ('default' backend) and attachments are
stored in the bucket automatically; leave Django's default file system
storage for local development.
"""
import boto3
from botocore.client import Config as BotoConfig

from django.core.exceptions import ImproperlyConfigured

from storages.backends.s3 import S3Storage

from .conf import setting


class SupportS3Storage(S3Storage):
    """S3-compatible storage for support-ticket media."""

    def __init__(self, *args, **kwargs):
        endpoint_url = setting('S3_ENDPOINT_URL')
        if not endpoint_url:
            raise ImproperlyConfigured(
                'SupportS3Storage requires SUPPORT_TICKET[\'S3_ENDPOINT_URL\'].'
            )
        kwargs.setdefault('endpoint_url', endpoint_url)
        kwargs.setdefault('access_key', setting('S3_ACCESS_KEY_ID'))
        kwargs.setdefault('secret_key', setting('S3_SECRET_ACCESS_KEY'))
        kwargs.setdefault('region_name', setting('S3_REGION', 'auto'))
        kwargs.setdefault('bucket_name', setting('S3_BUCKET', 'tickets'))
        kwargs.setdefault('file_overwrite', False)
        kwargs.setdefault('default_acl', 'public-read')
        # Private buckets are the safe default; Django will generate a
        # temporary signed URL when the attachment is read.
        kwargs.setdefault('querystring_auth', True)
        super().__init__(*args, **kwargs)

    def _get_boto_client(self):
        return boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            region_name=self.region_name,
            config=BotoConfig(signature_version='s3v4'),
        )


# Backwards-compatible alias (the storage was Supabase-specific in early versions)
SupabaseS3Storage = SupportS3Storage
