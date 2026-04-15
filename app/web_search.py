import requests
from bs4 import BeautifulSoup

#Search (SerpAPI or fallback)
def search_web(query):
    url = "https://serpapi.com/search.json"

    params = {
        "q": query,
        "api_key": "YOUR_SERPAPI_KEY"
    }

    res = requests.get(url, params=params)
    data = res.json()

    links = [r["link"] for r in data.get("organic_results", [])[:5]]
    return links


#  Extract text from pages
def extract_text(url):
    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")

        paragraphs = soup.find_all("p")
        text = " ".join([p.get_text() for p in paragraphs])

        return text[:3000]  # limit size
    except:
        return ""


#  Full pipeline
def fetch_web_data(query):
    urls = search_web(query)

    results = []
    for url in urls:
        text = extract_text(url)
        if text:
            results.append({
                "url": url,
                "text": text[:2000]
            })

    return results