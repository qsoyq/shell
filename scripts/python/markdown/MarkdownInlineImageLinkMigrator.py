#!/usr/bin/env python3

"""迁移内链图片
- 目录下 png/jpeg 格式的内链
- 目录下所有指定域名的内链
- 目录下所有非指定域名内链
"""

import re
import uuid
import urllib.parse
import typer
import urllib
from pathlib import Path
import hashlib
import hmac
import base64
import datetime
import httpx
import mimetypes
from dataclasses import dataclass


@dataclass
class ImageData:
    content_type: str
    data: bytes | str
    local_file_path: Path | None = None


app = typer.Typer()


class AliyunOSSTool:
    def __init__(
        self,
        region: str,
        bucket_name: str,
        access_key_id: str,
        access_key_secret: str,
        bucket_object_prefix: str = "",
    ):
        self._region = region
        self._access_key_id = access_key_id
        self._access_key_secret = access_key_secret
        self._bucket_name = bucket_name
        self._bucket_object_prefix = bucket_object_prefix
        self._host = f"{bucket_name}.{region}.aliyuncs.com"

    def _get_content_type(self, file_path):
        # 使用 mimetypes.guess_type() 来推断 MIME 类型
        content_type, _ = mimetypes.guess_type(file_path)
        # 如果未能推断出 MIME 类型，返回 'application/octet-stream' 作为默认值
        return content_type or "application/octet-stream"

    def generate_sign(
        self,
        http_method: str,
        object_name: str,
        date: str,
        content_type: str,
        content_md5: str = "",
    ) -> str:
        canonicalized_resource = f"/{self._bucket_name}/{object_name}"
        string_to_sign = (
            f"{http_method.upper()}\n"
            f"{content_md5}\n"
            f"{content_type}\n"
            f"{date}\n"
            f"{''}"  # CanonicalizedOSSHeaders，通常留空
            f"{canonicalized_resource}"
        )

        # 生成签名
        signature = base64.b64encode(
            hmac.new(
                self._access_key_secret.encode("utf-8"),
                string_to_sign.encode("utf-8"),
                hashlib.sha1,
            ).digest()
        ).decode("utf-8")

        return signature

    def generate_authorization(self, date: str, http_method: str, object_name: str, content_type: str) -> str:
        signature = self.generate_sign(http_method, object_name, date, content_type)
        authorization = f"OSS {self._access_key_id}:{signature}"
        return authorization

    def get_headers(self, http_method: str, object_name: str, content_type: str) -> dict:
        date = datetime.datetime.now(datetime.timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
        host = self._host
        authorization = self.generate_authorization(date, http_method, object_name, content_type)
        headers = {
            "Authorization": authorization,
            "Content-Type": content_type,
            "Date": date,
            "Host": host,
        }
        return headers

    def put(
        self,
        object_name: str,
        content: str | bytes,
        content_type: str,
        *,
        headers: dict | None = None,
    ) -> httpx.Response:
        url = f"https://{self._host}/{object_name}"
        _headers = self.get_headers("PUT", object_name, content_type)
        if headers is not None:
            _headers.update(headers)
        res = httpx.put(url, headers=_headers, content=content, verify=False)
        return res


class Workflow:
    def __init__(self, helper: AliyunOSSTool, directory: Path):
        self._helper = helper
        self._directory = directory
        self._pics: dict[str, Path] = {}

    def get_directory_pics(self):
        self._pics: dict[str, Path] = {}
        for file in self._directory.rglob("*"):
            img_pattern = re.compile(r".*\.(jpeg|png|jpg)$")
            if file.is_file() and re.match(img_pattern, str(file)):
                self._pics[urllib.parse.quote(file.name)] = file.resolve()
                self._pics[file.name] = file.resolve()

    def replace_inline_pics(self):
        for file in self._directory.rglob("*.md"):
            with file.open("r") as f:
                contents = f.read().split("\n")
            new_contents = list(map(self.new_line, contents))
            if new_contents == contents:
                continue
            with file.open("w") as f:
                f.write("\n".join(new_contents))
                typer.echo(f"\n[Debug] {file.name} changed.")

    def get_image_data_from_pic_url(self, url: str) -> ImageData | None:
        pics = self._pics
        helper = self._helper
        if url.startswith("http"):
            # 仅处理与当前图床不符的内链图片
            if not url.startswith(f"https://{self._helper._host}"):
                ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
                res = httpx.get(url, verify=False, headers={"User-Agent": ua})
                if res.status_code >= 400:
                    typer.echo(f"\n[Warning] can't fetch data: {res.status_code}\t{url}\t{res.content}")
                    return None
                else:
                    content_type = res.headers.get("content-type", "application/octet-stream")
                    data = res.content
                    return ImageData(content_type=content_type, data=data)
            else:
                return None

        else:
            fpath: Path | None = pics.get(url)
            if not fpath:
                typer.echo(f"\n[Warning] {url} not found local file.")
                return None

            with fpath.open("rb") as fp:
                data = fp.read()
                content_type = helper._get_content_type(fpath.resolve())
                return ImageData(content_type=content_type, data=data, local_file_path=fpath)

    def new_line(self, line: str):
        helper = self._helper

        pattern = r"!\[([^\]]*?)\]\((.*?)\)"
        matches = re.findall(pattern, line)
        if not matches:
            return line
        _, url = matches[0]
        assert isinstance(url, str)
        image_data = self.get_image_data_from_pic_url(url)
        if image_data is None:
            return line

        random_path = uuid.uuid4().hex
        object_name = f"{helper._bucket_object_prefix}/{random_path}" if helper._bucket_object_prefix else f"{random_path}"

        if image_data.content_type.startswith("image/"):
            ext = image_data.content_type.split("/")[-1]
            object_name = f"{object_name}.{ext}"

        res = helper.put(
            object_name,
            image_data.data,
            image_data.content_type,
            headers={"Content-Disposition": "inline"},
        )
        if res.status_code >= 400:
            assert image_data.local_file_path
            typer.echo(f"\n[Error]: put file {image_data.local_file_path.name} failed. detail: {res.status_code}, {res.text}")
            return line
        new_url = f"https://{helper._host}/{object_name}"
        new_line = line.replace(url, new_url)
        typer.echo(f"\n[Debug] {line} => {new_line}")
        return new_line


@app.command()
def main(
    bucket_object_prefix: str = typer.Option(
        ...,
        "--bucket-object-prefix",
        prompt=True,
        help="阿里云 Bucket Object Prefix",
        envvar="oss_bucket_prefix",
    ),
    bucket_name: str = typer.Option(
        ...,
        "--bucket-name",
        prompt=True,
        help="阿里云 Bucket Name",
        envvar="oss_bucket_name",
    ),
    access_key_id: str = typer.Option(
        ...,
        "--access-key-id",
        prompt=True,
        help="阿里云 access key id",
        envvar="oss_access_key_id",
    ),
    access_key_secret: str = typer.Option(
        ...,
        "--access-key-secret",
        prompt=True,
        help="阿里云 access key id",
        envvar="oss_access_key_secret",
    ),
    region: str = typer.Option(
        ...,
        "--origin",
        prompt=True,
        help="阿里云 Origin",
        envvar="oss_region",
    ),
    directory: Path = typer.Option(..., "-d", "--directory", help="扫描目录"),
):
    helper = AliyunOSSTool(region, bucket_name, access_key_id, access_key_secret, bucket_object_prefix)
    workflow = Workflow(helper, directory)
    workflow.get_directory_pics()
    workflow.replace_inline_pics()


if __name__ == "__main__":
    app()
