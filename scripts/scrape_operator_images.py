#!/usr/bin/env python3
import json
import re
import time
from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OPERATORS_PATH = ROOT / "data" / "operators" / "operators.json"
IMAGES_DIR = ROOT / "data" / "operators" / "images"
MANIFEST_PATH = IMAGES_DIR / "manifest.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
}

BAD_IMAGE_HINTS = [
    "logo",
    "favicon",
    "icon",
    "sprite",
    "avatar",
    "profile",
    "team",
    "whatsapp",
    "facebook",
    "instagram",
    "twitter",
    "linkedin",
    "youtube",
    "tripadvisor",
    "payment",
    "visa",
    "mastercard",
    "map",
    "marker",
    "flag",
    "loader",
    "placeholder",
    "transparent",
    "banner-ad",
    "jquery",
    "wp-content/plugins",
    "wp-includes",
]

GOOD_IMAGE_HINTS = [
    "everest",
    "annapurna",
    "nepal",
    "himalaya",
    "himalayan",
    "trek",
    "trekking",
    "mountain",
    "peak",
    "base-camp",
    "basecamp",
    "luxury",
    "lodge",
    "helicopter",
    "tour",
    "travel",
]


@dataclass(frozen=True)
class Candidate:
    image_url: str
    page_url: str
    source_type: str
    base_score: int


def normalize_url(url: str) -> str:
    parsed = urlparse(url)
    return parsed._replace(fragment="").geturl()


def is_probably_bad_url(url: str) -> bool:
    lower = url.lower()
    if lower.startswith("data:"):
        return True
    if lower.endswith(".svg"):
        return True
    return any(hint in lower for hint in BAD_IMAGE_HINTS)


def parse_srcset(value: str) -> Iterable[str]:
    for part in value.split(","):
        bits = part.strip().split()
        if bits:
            yield bits[0]


def extract_candidates(html: str, page_url: str) -> list[Candidate]:
    soup = BeautifulSoup(html, "html.parser")
    candidates: list[Candidate] = []

    for selector, attr, score in [
        ('meta[property="og:image"]', "content", 45),
        ('meta[property="og:image:secure_url"]', "content", 45),
        ('meta[name="twitter:image"]', "content", 40),
        ('link[rel="image_src"]', "href", 35),
    ]:
        for node in soup.select(selector):
            raw = node.get(attr)
            if raw:
                candidates.append(Candidate(urljoin(page_url, raw), page_url, selector, score))

    for img in soup.find_all("img"):
        attrs = ["src", "data-src", "data-lazy-src", "data-original", "data-image"]
        for attr in attrs:
            raw = img.get(attr)
            if raw:
                candidates.append(Candidate(urljoin(page_url, raw), page_url, f"img[{attr}]", 15))
        for attr in ["srcset", "data-srcset"]:
            raw = img.get(attr)
            if raw:
                for src in parse_srcset(raw):
                    candidates.append(Candidate(urljoin(page_url, src), page_url, f"img[{attr}]", 18))

    for raw in re.findall(r"url\(['\"]?([^'\"\)]+)['\"]?\)", html):
        candidates.append(Candidate(urljoin(page_url, raw), page_url, "css-background", 10))

    deduped: dict[str, Candidate] = {}
    for candidate in candidates:
        url = normalize_url(candidate.image_url)
        if not url.startswith(("http://", "https://")):
            continue
        if is_probably_bad_url(url):
            continue
        existing = deduped.get(url)
        if existing is None or candidate.base_score > existing.base_score:
            deduped[url] = Candidate(url, candidate.page_url, candidate.source_type, candidate.base_score)
    return list(deduped.values())


def score_candidate(candidate: Candidate, image: Image.Image) -> int:
    width, height = image.size
    url = candidate.image_url.lower()
    page = candidate.page_url.lower()

    score = candidate.base_score
    score += min((width * height) // 80000, 35)
    if width >= 1000:
        score += 8
    if height >= 550:
        score += 8
    aspect = width / max(height, 1)
    if 1.15 <= aspect <= 2.4:
        score += 16
    else:
        score -= 20

    for hint in GOOD_IMAGE_HINTS:
        if hint in url:
            score += 8
        if hint in page:
            score += 3

    for hint in BAD_IMAGE_HINTS:
        if hint in url:
            score -= 40

    return score


def fetch_html(url: str) -> str | None:
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        if res.status_code >= 400:
            return None
        content_type = res.headers.get("content-type", "")
        if "text/html" not in content_type and "application/xhtml" not in content_type and not res.text.strip().startswith("<"):
            return None
        return res.text
    except requests.RequestException:
        return None


def fetch_image(url: str) -> Image.Image | None:
    try:
        res = requests.get(url, headers=HEADERS, timeout=7)
        if res.status_code >= 400:
            return None
        content_type = res.headers.get("content-type", "")
        if "image" not in content_type and not re.search(r"\.(jpg|jpeg|png|webp)(\?|$)", url, re.I):
            return None
        image = Image.open(BytesIO(res.content))
        image.load()
        return ImageOps.exif_transpose(image)
    except Exception:
        return None


def pre_score_candidate(candidate: Candidate) -> int:
    text = f"{candidate.image_url} {candidate.page_url}".lower()
    score = candidate.base_score
    for hint in GOOD_IMAGE_HINTS:
        if hint in text:
            score += 5
    for hint in BAD_IMAGE_HINTS:
        if hint in text:
            score -= 25
    if re.search(r"\.(jpg|jpeg|png|webp)(\?|$)", candidate.image_url, re.I):
        score += 8
    return score


def save_cover(image: Image.Image, path: Path) -> None:
    image = image.convert("RGB")
    width, height = image.size
    target_aspect = 1.5
    current_aspect = width / height

    if current_aspect > target_aspect:
        new_width = int(height * target_aspect)
        left = (width - new_width) // 2
        image = image.crop((left, 0, left + new_width, height))
    elif current_aspect < target_aspect:
        new_height = int(width / target_aspect)
        top = max((height - new_height) // 3, 0)
        image = image.crop((0, top, width, top + new_height))

    image = image.resize((1200, 800), Image.Resampling.LANCZOS)
    image.save(path, "JPEG", quality=88, optimize=True)


def operator_pages(operator: dict) -> list[str]:
    pages = []
    pages.extend(operator.get("source_urls", []))
    pages.extend(operator.get("websites", []))
    seen = set()
    ordered = []
    for url in pages:
        normalized = normalize_url(url)
        if normalized not in seen:
            ordered.append(normalized)
            seen.add(normalized)
    return ordered


def scrape_operator(operator: dict) -> dict:
    print(f"Scraping {operator['name']}...")
    candidates: list[Candidate] = []
    fetched_pages = []

    for page_url in operator_pages(operator):
        html = fetch_html(page_url)
        time.sleep(0.25)
        if not html:
            continue
        fetched_pages.append(page_url)
        candidates.extend(extract_candidates(html, page_url))

    candidates = sorted(candidates, key=pre_score_candidate, reverse=True)[:35]

    ranked = []
    seen = set()
    for candidate in candidates:
        if candidate.image_url in seen:
            continue
        seen.add(candidate.image_url)
        image = fetch_image(candidate.image_url)
        time.sleep(0.12)
        if image is None:
            continue
        width, height = image.size
        if width < 640 or height < 360:
            continue
        score = score_candidate(candidate, image)
        ranked.append((score, candidate, image))

    ranked.sort(key=lambda item: item[0], reverse=True)
    output_path = IMAGES_DIR / f"{operator['id']}.jpg"

    if ranked:
        score, candidate, image = ranked[0]
        save_cover(image, output_path)
        print(f"  saved {output_path.name} from {candidate.image_url} ({image.size[0]}x{image.size[1]}, score {score})")
        return {
            "operator_id": operator["id"],
            "operator_name": operator["name"],
            "status": "saved",
            "cover_image": str(output_path.relative_to(ROOT)),
            "source_image_url": candidate.image_url,
            "source_page_url": candidate.page_url,
            "source_type": candidate.source_type,
            "original_width": image.size[0],
            "original_height": image.size[1],
            "score": score,
            "candidate_count": len(ranked),
            "fetched_pages": fetched_pages,
        }

    print("  no suitable image found")
    return {
        "operator_id": operator["id"],
        "operator_name": operator["name"],
        "status": "not_found",
        "candidate_count": 0,
        "fetched_pages": fetched_pages,
    }


def main() -> None:
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    data = json.loads(OPERATORS_PATH.read_text())
    results = [scrape_operator(operator) for operator in data["operators"]]
    MANIFEST_PATH.write_text(json.dumps({
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "note": "Images were scraped from public operator/source pages for local demo use. Verify rights before public or commercial use.",
        "images": results,
    }, indent=2))
    saved = sum(1 for result in results if result["status"] == "saved")
    print(f"\nSaved {saved}/{len(results)} operator cover images")
    print(f"Manifest: {MANIFEST_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
