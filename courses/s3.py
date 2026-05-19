import mimetypes

from botocore.client import Config

from django.conf import settings


def s3_client():
    import boto3

    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )


def _get_object_presign_params(object_key: str) -> dict:
    """
    Build get_object params so browsers treat media as inline (play in-page) instead of downloading.
    """
    params: dict = {"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": object_key}
    key_lower = object_key.lower()
    if key_lower.endswith((".mp4", ".m4v")):
        params["ResponseContentDisposition"] = "inline"
        params["ResponseContentType"] = "video/mp4"
    elif key_lower.endswith(".webm"):
        params["ResponseContentDisposition"] = "inline"
        params["ResponseContentType"] = "video/webm"
    elif key_lower.endswith(".mov"):
        params["ResponseContentDisposition"] = "inline"
        params["ResponseContentType"] = "video/quicktime"
    elif key_lower.endswith((".jpg", ".jpeg", ".png", ".webp", ".gif")):
        params["ResponseContentDisposition"] = "inline"
        guessed, _ = mimetypes.guess_type(object_key)
        if guessed:
            params["ResponseContentType"] = guessed
    return params


def presigned_get_url(*, object_key: str, expires_in: int) -> str:
    client = s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params=_get_object_presign_params(object_key),
        ExpiresIn=expires_in,
    )
