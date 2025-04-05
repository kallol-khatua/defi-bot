from fastapi import APIRouter, Query
import requests
from bs4 import BeautifulSoup
import os
import feedparser
from openai import OpenAI
from openai import RateLimitError

router = APIRouter()

# Load API key from environment variable
# You should set this in your environment or .env file
api_key = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

# ---------------------- Scraping ---------------------- #

def scrape_coindesk_rss():
    print("[DEBUG] Fetching CoinDesk RSS feed...")
    feed_url = "https://www.coindesk.com/arc/outboundfeeds/rss/"
    feed = feedparser.parse(feed_url)

    headlines = [entry.title for entry in feed.entries[:3]]
    print(f"[DEBUG] Headlines from RSS: {headlines}")
    return headlines

# ---------------------- Summarization ---------------------- #

def summarize_with_ai(text):
    try:
        print(f"[DEBUG] Sending text to OpenAI: {text[:50]}...")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using the model from your curl example
            messages=[
                {"role": "system", "content": "Summarize this news headline in one sentence."},
                {"role": "user", "content": text}
            ]
        )
        
        summary = response.choices[0].message.content.strip()
        print(f"[DEBUG] Received summary: {summary}")
        return summary
        
    except RateLimitError as e:
        print(f"[ERROR] OpenAI Rate Limit: {e}")
        return "API quota exceeded. Unable to summarize."
    except Exception as e:
        print(f"[ERROR] OpenAI API error: {str(e)}")
        return f"Error generating summary: {str(e)}"

# ---------------------- API Route ---------------------- #

@router.get("/")
async def summarize_news(source: str = Query("coindesk")):
    if source != "coindesk":
        return {"error": "Only 'coindesk' is supported currently."}

    headlines = scrape_coindesk_rss()
    if not headlines:
        return {"error": "No headlines found from CoinDesk RSS."}

    print(f"[DEBUG] Got {len(headlines)} headlines, generating summaries...")
    summaries = []
    for headline in headlines:
        summary = summarize_with_ai(headline)
        summaries.append(summary)
    
    return {"source": source, "headlines": headlines, "summaries": summaries}