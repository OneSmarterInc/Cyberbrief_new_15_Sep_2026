import hashlib
import re
from datetime import timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
import feedparser
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from django.db import close_old_connections
from django.utils import timezone

from .models import Article, RSSFeed

# Read directly from the local folder we just created!
MODEL_PATH = "./ai_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)

def clean_text(value):
    text = re.sub(r"<[^>]+>", " ", value or "")
    return " ".join(text.split())

def detect_category(title, summary, default_category=None):
    # The platform is now strictly for Cybersecurity
    return "Cybersecurity"

def make_guid(source, link, title):
    return hashlib.sha256(f"{source}|{link}|{title}".encode("utf-8")).hexdigest()

def reset_article_database():
    deleted_count, _ = Article.objects.all().delete()
    print(f"Database Reset: Removed {deleted_count} old articles.")
    return deleted_count

def get_active_feeds():
    feeds = RSSFeed.objects.filter(is_active=True)
    # Fallback default feeds dedicated to Cybersecurity
    if not feeds.exists():
        return [
            {"name": "The Hacker News", "url": "https://feeds.feedburner.com/TheHackersNews", "category": "Cybersecurity"},
            {"name": "BleepingComputer", "url": "https://www.bleepingcomputer.com/feed/", "category": "Cybersecurity"},
            {"name": "Krebs on Security", "url": "https://krebsonsecurity.com/feed/", "category": "Cybersecurity"},
            {"name": "Dark Reading", "url": "https://www.darkreading.com/rss.xml", "category": "Cybersecurity"},
        ]
    # Force everything to the Cybersecurity category
    return [{"name": f.name, "url": f.url, "category": "Cybersecurity"} for f in feeds]

def fetch_feed_data(feed_info):
    items = []
    try:
        response = requests.get(feed_info["url"], timeout=6, headers={"User-Agent": "Mozilla/5.0"})
        response.raise_for_status()
        feed = feedparser.parse(response.content)
        for item in feed.entries[:4]:
            items.append({"feed_info": feed_info, "item": item})
    except Exception:
        pass
    return items

def fetch_and_store_news():
    close_old_connections()
    
    # --- AUTOMATIC 30-DAY PURGE ---
    thirty_days_ago = timezone.now() - timedelta(days=30)
    expired_count, _ = Article.objects.filter(created_at__lt=thirty_days_ago).delete()
    if expired_count > 0:
        print(f"Database Cleanup: Purged {expired_count} stories older than 30 days.")
    # ------------------------------

    current_rss_feeds = get_active_feeds()
    raw_items = []

    with ThreadPoolExecutor(max_workers=25) as executor:
        futures = [executor.submit(fetch_feed_data, feed) for feed in current_rss_feeds]
        for future in as_completed(futures):
            raw_items.extend(future.result())

    new_found = 0
    for data in raw_items:
        feed_info = data["feed_info"]
        item = data["item"]
        title = clean_text(item.get("title"))
        raw_summary = clean_text(item.get("summary") or item.get("description") or "")
        link = item.get("link", "")

        if not title:
            continue

        category = detect_category(title, raw_summary, default_category=feed_info.get("category"))
        guid = make_guid(feed_info["name"], link, title)

        if not Article.objects.filter(guid=guid).exists():
            Article.objects.create(
                guid=guid,
                source=feed_info["name"],
                category=category,
                title=title,
                ai_headline="",  # Marks pending for AI summary
                summary=raw_summary,
                link=link,
                published=clean_text(item.get("published") or item.get("updated") or ""),
            )
            new_found += 1
            print(f"--> NEW [{category}]: {title[:40]}...")

    print(f"Live Scan Complete: Checked {len(raw_items)} articles. Added {new_found} new.")

    # PHASE 2: Generate summaries for newly added entries
    pending_articles = Article.objects.filter(ai_headline="")
    if pending_articles.exists():
        print(f"AI Model Processing {pending_articles.count()} unsummarized articles...")

    for art in pending_articles:
        input_text = f"{art.title}. {art.summary}"
        if len(input_text.split()) < 20:
            final_summary = input_text
        else:
            try:
                inputs = tokenizer(input_text, max_length=1024, truncation=True, return_tensors="pt")
                output = model.generate(
                    **inputs, 
                    max_length=75,
                    min_length=45,
                    do_sample=False
                )
                final_summary = tokenizer.decode(output[0], skip_special_tokens=True)
            except Exception as exc:
                print(f"AI Error on '{art.title[:20]}': {exc}")
                continue

        art.ai_headline = art.title[:500]
        art.summary = final_summary[:2000]
        art.save(update_fields=["ai_headline", "summary"])
        print(f"--> AI Summary Ready: {art.title[:30]}...")

    close_old_connections()

def get_stored_news():
    return Article.objects.all().order_by("-id")