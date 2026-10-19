"""
S3-compatible storage backend pointed at Supabase.

Supabase exposes an S3-compatible gateway:
  endpoint  : https://<project-ref>.supabase.co/storage/v1/s3
  region    : <project region>
  keys      : Supabase Dashboard -> Settings -> API / Storage S3 keys
"""
import boto3
from botocore.client import Config as BotoConfig
from django.conf import settings
from storages.backends.s3 import S3Storage


class SupabaseS3Storage(S3Storage):
    """Supabase S3-compatible storage for ticket attachments."""

    def __init__(self, *args, **kwargs):
        kwargs.setdefault(
            'endpoint_url', settings.SUPABASE_S3_ENDPOINT_URL
        )
        kwargs.setdefault(
            'access_key', settings.SUPABASE_S3_ACCESS_KEY_ID
        )
        kwargs.setdefault(
            'secret_key', settings.SUPABASE_S3_SECRET_ACCESS_KEY
        )
        kwargs.setdefault(
            'region_name', settings.SUPABASE_S3_REGION
        )
        kwargs.setdefault('bucket_name', settings.SUPABASE_STORAGE_BUCKET)
        kwargs.setdefault('file_overwrite', False)
        kwargs.setdefault('default_acl', 'public-read')
        kwargs.setdefault('querystring_auth', False)
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
