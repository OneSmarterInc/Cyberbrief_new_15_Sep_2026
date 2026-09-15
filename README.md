# RSS News AI

A simple news app with:
- React Native Expo frontend
- Django REST backend
- RSS feeds for news
- Local Ollama model for AI-generated headlines

## Project structure

rss_news_ai_project/
  backend/
  mobile/

## 1. Backend

Open a terminal:

```bash
cd backend
python -m venv venv
```

Windows:
```bash
venv\Scripts\activate
```

Install packages:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start Django:

```bash
python manage.py runserver 0.0.0.0:8000
```

API:
- http://127.0.0.1:8000/api/news/
- http://127.0.0.1:8000/api/health/

## 2. Ollama

Install Ollama and make sure it is running.

Example:

```bash
ollama pull llama3.2
ollama serve
```

The backend uses:

http://127.0.0.1:11434/api/generate

If Django and Ollama are on the same computer, this works directly.

## 3. Mobile app

Install Node.js, then:

```bash
cd mobile
npm install
npx expo start
```

For a physical phone, change `API_BASE_URL` in `mobile/src/config.js` to your computer's local IP address, for example:

```text
http://192.168.1.10:8000/api
```

Your phone and computer must be on the same Wi-Fi network.

## RSS feeds

The backend includes technology, AI and cybersecurity RSS feeds. You can add more feeds in:

backend/news_api/services.py

## Important

The app does not send news to a cloud AI service. Headline generation is done by your local Ollama server.
