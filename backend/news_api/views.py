import io
import base64
import datetime
import asyncio
import qrcode
import pyotp
import edge_tts

from django.http import HttpResponse
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.db import models
from django.utils import timezone
from django.utils.dateparse import parse_datetime  # <--- IMPORTED TO PARSE SCHEDULED DATES

from .models import Article, SocialMediaConfig
from .services import get_stored_news

FRONTEND_URL = "http://localhost:5173" 
BACKEND_URL = "http://localhost:8000"

IMAGE_URL = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"

@api_view(["GET"])
def health(request):
    return Response({"status": "ok"})

@api_view(["GET"])
def news(request):
    articles = Article.objects.exclude(ai_headline="").order_by("-id")
    data = []

    for article in articles:
        data.append({
            "id": article.id,
            "source": article.source,
            "category": article.category,
            "title": article.ai_headline or article.title,
            "original_title": article.title,
            "summary": article.summary,
            "link": article.link,
            "published": article.published,
            "is_active": article.is_active,
            "image_url": IMAGE_URL
        })

    return Response({
        "count": len(data),
        "articles": data
    })

@api_view(["POST"])
def register(request):
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")

    if not username or not email or not password:
        return Response({"error": "Username, email and password are required."}, status=400)

    if len(password) < 6:
        return Response({"error": "Password must be at least 6 characters."}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists."}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists."}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "message": "Registration successful.",
        "token": token.key,
        "user": {"id": user.id, "username": user.username, "email": user.email}
    }, status=201)

@api_view(["POST"])
def login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid username or password."}, status=401)

    is_admin = user.is_staff or user.is_superuser
    if not is_admin:
        return Response({"error": "Access denied. Admin privileges required."}, status=403)

    from .models import Admin2FA
    two_fa, created = Admin2FA.objects.get_or_create(user=user)

    if not two_fa.is_enabled:
        return Response({"status": "setup_required", "user_id": user.id})
    else:
        return Response({"status": "mfa_required", "user_id": user.id})

@api_view(["POST"])
def setup_2fa(request):
    user_id = request.data.get("user_id")
    if not user_id:
        return Response({"error": "User ID missing."}, status=400)
        
    try:
        user = User.objects.get(id=user_id)
        from .models import Admin2FA
        two_fa, _ = Admin2FA.objects.get_or_create(user=user)
        
        secret = pyotp.random_base32()
        two_fa.totp_secret = secret
        two_fa.save()
        
        totp_url = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email or user.username, 
            issuer_name="The Aggregate Desk"
        )
        
        qr = qrcode.make(totp_url)
        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return Response({
            "secret": secret,
            "qr_image": f"data:image/png;base64,{qr_base64}"
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["POST"])
def verify_2fa(request):
    user_id = request.data.get("user_id")
    code = request.data.get("code", "").strip()
    
    try:
        user = User.objects.get(id=user_id)
        from .models import Admin2FA
        two_fa = Admin2FA.objects.get(user=user)
        
        totp = pyotp.TOTP(two_fa.totp_secret)
        if totp.verify(code, valid_window=1):
            two_fa.is_enabled = True
            two_fa.save()
            
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful.",
                "token": token.key,
                "user": {"id": user.id, "username": user.username, "email": user.email, "is_admin": True}
            })
        else:
            return Response({"error": "Invalid 2FA code."}, status=401)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def toggle_article(request, article_id):
    try:
        article = Article.objects.get(id=article_id)
        article.is_active = not article.is_active
        article.save()
        return Response({"status": "success", "is_active": article.is_active})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["POST"])
def submit_query(request, article_id):
    try:
        from .models import ArticleQuery
        article = Article.objects.get(id=article_id)
        text = request.data.get("query_text", "").strip()
        
        if not text:
            return Response({"error": "Query text cannot be empty."}, status=400)
            
        ArticleQuery.objects.create(article=article, query_text=text)
        return Response({"status": "success", "message": "Query submitted."})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def get_queries(request):
    from .models import ArticleQuery
    queries = ArticleQuery.objects.all()
    data = []
    for q in queries:
        data.append({
            "id": q.id,
            "article_id": q.article.id,
            "article_title": q.article.title,
            "article_is_active": q.article.is_active,
            "query_text": q.query_text,
            "is_resolved": q.is_resolved,
            "created_at": q.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return Response({"queries": data})

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def toggle_query_status(request, query_id):
    try:
        from .models import ArticleQuery
        query = ArticleQuery.objects.get(id=query_id)
        query.is_resolved = not query.is_resolved
        query.save()
        return Response({"status": "success"})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def manage_subscribers(request):
    from .models import Subscriber
    
    if request.method == "POST":
        email = request.data.get("email", "").strip()
        if not email: return Response({"error": "Email is required"}, status=400)
            
        sub, created = Subscriber.objects.get_or_create(email=email)
        if not created:
            sub.is_active = True
            sub.save()
            
        return Response({
            "status": "success",
            "subscriber": {
                "id": sub.id, "email": sub.email, 
                "subscribed_at": sub.subscribed_at.strftime("%Y-%m-%d %H:%M"),
                "emails_received": sub.emails_received, "is_active": sub.is_active
            }
        })
    
    subs = Subscriber.objects.all()
    data = [{"id": s.id, "email": s.email, "subscribed_at": s.subscribed_at.strftime("%Y-%m-%d %H:%M"), "emails_received": s.emails_received, "is_active": s.is_active} for s in subs]
    return Response({"subscribers": data})

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def toggle_subscriber(request, sub_id):
    try:
        from .models import Subscriber
        sub = Subscriber.objects.get(id=sub_id)
        sub.is_active = not sub.is_active
        sub.save()
        return Response({"status": "success", "is_active": sub.is_active})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def delete_subscriber(request, sub_id):
    try:
        from .models import Subscriber
        sub = Subscriber.objects.get(id=sub_id)
        sub.delete()
        return Response({"status": "success", "message": "Subscriber permanently deleted."})
    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def manage_rss_feeds(request):
    from .models import RSSFeed
    if request.method == "POST":
        name = request.data.get("name", "").strip()
        url = request.data.get("url", "").strip()
        category = request.data.get("category", "").strip()
        
        if not name or not url or not category:
            return Response({"error": "Name, URL, and category are required."}, status=400)
            
        feed, created = RSSFeed.objects.get_or_create(url=url, defaults={"name": name, "category": category})
        if not created:
            feed.name = name
            feed.category = category
            feed.is_active = True
            feed.save()
            
        return Response({
            "status": "success",
            "feed": {"id": feed.id, "name": feed.name, "url": feed.url, "category": feed.category, "is_active": feed.is_active}
        })
    
    feeds = RSSFeed.objects.all().order_by("-id")
    data = [{"id": f.id, "name": f.name, "url": f.url, "category": f.category, "is_active": f.is_active} for f in feeds]
    return Response({"feeds": data})

@api_view(["POST", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def modify_rss_feed(request, feed_id):
    from .models import RSSFeed
    try:
        feed = RSSFeed.objects.get(id=feed_id)
        if request.method == "DELETE":
            feed.delete()
            return Response({"status": "success", "message": "Feed deleted."})
        else:
            feed.is_active = not feed.is_active
            feed.save()
            return Response({"status": "success", "is_active": feed.is_active})
    except RSSFeed.DoesNotExist:
        return Response({"error": "Feed not found."}, status=404)

@api_view(["GET"])
def unsubscribe_email(request):
    email = request.GET.get("email")
    if email:
        from .models import Subscriber
        Subscriber.objects.filter(email=email).update(is_active=False)
        return HttpResponse(
            f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 50px auto; text-align: center; border: 2px solid #161412; padding: 40px; background-color: #F3EEE3;">
                <h1 style="color: #161412; font-family: Georgia, serif;">Unsubscribed</h1>
                <p style="color: #5E574C;"><strong>{email}</strong> has been successfully removed.</p>
                <p style="color: #5E574C; font-size: 14px;">You will no longer receive daily briefings from The Aggregate.</p>
            </div>
            """
        )
    return HttpResponse("Invalid request.", status=400)

def generate_email_html(articles, recipient_email):
    unsubscribe_link = f"{BACKEND_URL}/api/unsubscribe/?email={recipient_email}"
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    PUBLIC_IMAGES = [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1510511459019-5d6459c40318?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=300&q=80",
    ]
    
    html = f"""<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="margin: 0; padding: 0; background-color: #ffffff;">
        <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #333333;">
            <h2 style="font-size: 16px; color: #000000; margin: 0 0 10px 0; font-weight: bold;">Cyberbriefs Newsletter</h2>
            <hr style="border: 0; border-top: 1px solid #cccccc; margin-bottom: 15px;" />
            <p style="font-size: 11px; line-height: 1.5; color: #555555; margin-bottom: 15px;">
                This article stresses the importance of ensuring that an organization's Non-Human Identities (NHIs) are well-prepared to tackle the latest cybersecurity threats.
            </p>
            <p style="font-size: 11px; color: #555555; margin-bottom: 30px;">Summary Generated at {current_date}</p>
    """
    
    if not articles:
        html += "<p style='color: red;'><strong>Notice:</strong> No active articles were found in the database.</p>"
    else:
        for i, a in enumerate(articles):
            title = a.ai_headline or a.title
            summary = a.summary or "Summary unavailable."
            article_link = a.link or "#"
            img_url = PUBLIC_IMAGES[i % len(PUBLIC_IMAGES)]
            if len(summary) > 230:
                summary = summary[:227] + "..."
            
            html += f"""
            <div style="margin-bottom: 15px; background-color: #F8F9FA; border-radius: 8px; border: 1px solid #EBE4D5;">
                <a href="{article_link}" target="_blank" style="text-decoration: none; color: inherit; display: block; padding: 15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td width="115" valign="top" style="padding-right: 15px;">
                                <img src="{img_url}" width="100" height="100" style="display: block; border-radius: 8px; object-fit: cover; width: 100px; height: 100px; border: none;" alt="News" />
                            </td>
                            <td valign="top">
                                <h3 style="margin: 0 0 8px 0; font-size: 14px; font-family: Arial, sans-serif; color: #000000;">{title}</h3>
                                <p style="margin: 0; font-size: 12px; color: #333333; line-height: 1.4; font-family: Arial, sans-serif;">{summary}</p>
                            </td>
                        </tr>
                    </table>
                </a>
            </div>
            """
            
    html += f"""
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #cccccc;">
                <p style="color: #777777; font-size: 11px; margin-bottom: 15px;">You are receiving this automated dispatch because you subscribed.</p>
                <a href="{unsubscribe_link}" style="display: inline-block; padding: 10px 20px; background-color: #000000; color: #ffffff; font-size: 11px; font-weight: bold; text-decoration: none; border-radius: 4px; text-transform: uppercase;">Unsubscribe</a>
            </div>
        </div>
    </body>
    </html>
    """
    return html

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def manage_smtp(request):
    from .models import SMTPConfig
    if request.method == "POST":
        config = SMTPConfig.objects.first() or SMTPConfig()
        config.name = request.data.get("name", "")
        config.email = request.data.get("email", "")
        config.reply_to = request.data.get("reply_to", "")
        config.host = request.data.get("host", "")
        config.port = int(request.data.get("port", 587))
        config.username = request.data.get("username", "")
        config.security_protocol = request.data.get("security_protocol", "TLS")
        config.daily_send_time = request.data.get("daily_send_time", "08:00")
        if request.data.get("password"): config.password = request.data.get("password")
        config.save()
        return Response({"status": "success"})
    config = SMTPConfig.objects.first()
    if config: return Response({"name": config.name, "email": config.email, "reply_to": config.reply_to, "host": config.host, "port": config.port, "username": config.username, "security_protocol": config.security_protocol, "daily_send_time": config.daily_send_time, "password": "" })
    return Response({})

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def send_test_email(request):
    try:
        from .models import SMTPConfig
        from django.core.mail import EmailMultiAlternatives
        from django.core.mail.backends.smtp import EmailBackend
        recipient = request.data.get("email", "").strip()
        config = SMTPConfig.objects.first()
        backend = EmailBackend(host=config.host, port=config.port, username=config.username or config.email, password=config.password, use_tls=(config.security_protocol == 'TLS'), use_ssl=(config.security_protocol == 'SSL'))
        msg = EmailMultiAlternatives(subject='Test Email', body='Working!', from_email=f"{config.name} <{config.email}>", to=[recipient], connection=backend)
        msg.send()
        return Response({"status": "success"})
    except Exception as e: return Response({"error": str(e)}, status=400)

@api_view(["POST"])
def subscribe_newsletter(request):
    try:
        from .models import Subscriber
        recipient = request.data.get("email", "").strip()
        if not recipient: 
            return Response({"error": "Email is required."}, status=400)
            
        sub = Subscriber.objects.filter(email=recipient).first()
        if sub:
            if sub.is_active:
                return Response({"status": "already_subscribed", "message": "Email is already on the list."})
            else:
                sub.is_active = True
                sub.save()
                return Response({"status": "success", "message": "Subscription reactivated!"})
        
        Subscriber.objects.create(email=recipient, is_active=True)
        return Response({"status": "success", "message": "Subscription added!"})
    except Exception as e:
        return Response({"error": f"Database Error: {str(e)}"}, status=400)

def process_mass_blast():
    try:
        from .models import SMTPConfig, Article, Subscriber
        from django.core.mail import EmailMultiAlternatives
        from django.core.mail.backends.smtp import EmailBackend
        
        config = SMTPConfig.objects.first()
        subscribers = Subscriber.objects.filter(is_active=True)
        if not subscribers: 
            return False, "No active subscribers found."
            
        latest_articles = list(Article.objects.filter(is_active=True).order_by('-id')[:5])
        backend = EmailBackend(host=config.host, port=config.port, username=config.username or config.email, password=config.password, use_tls=(config.security_protocol == 'TLS'), use_ssl=(config.security_protocol == 'SSL'))
        
        sent_count = 0
        for sub in subscribers:
            try:
                user_html = generate_email_html(latest_articles, sub.email)
                msg = EmailMultiAlternatives(
                    subject='Cyberbriefs Newsletter',
                    body='Please view this email in an HTML-compatible client.',
                    from_email=f"{config.name or 'Cyberbriefs'} <{config.email}>",
                    to=[sub.email],
                    reply_to=[config.reply_to] if config.reply_to else None,
                    connection=backend
                )
                msg.attach_alternative(user_html, "text/html")
                msg.send()
                sub.emails_received += 1
                sub.save()
                sent_count += 1
            except Exception as e:
                print(f"Failed to send to {sub.email}: {e}")
        return True, f"Sent {sent_count} emails!"
    except Exception as e:
        return False, str(e)

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def send_daily_blast(request):
    success, message = process_mass_blast()
    if success: 
        return Response({"status": "success", "message": message})
    else: 
        return Response({"error": message}, status=400)

def generate_audio(request):
    text = request.GET.get('text', 'No text provided.')
    async def fetch_audio():
        communicate = edge_tts.Communicate(text, "en-US-AriaNeural")
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        return audio_data

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    audio_bytes = loop.run_until_complete(fetch_audio())
    return HttpResponse(audio_bytes, content_type="audio/mpeg")

# --- SOCIAL MEDIA CONFIG ENDPOINTS ---
@api_view(["GET"])
@permission_classes([AllowAny])
def get_social_links(request):
    config, _ = SocialMediaConfig.objects.get_or_create(id=1)
    return Response({
        "twitter": config.twitter,
        "youtube": config.youtube,
        "email": config.email,
        "insta": config.insta,
        "facebook": config.facebook,
    })

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def admin_social_links(request):
    config, _ = SocialMediaConfig.objects.get_or_create(id=1)
    if request.method == "POST":
        config.twitter = request.data.get("twitter", "")
        config.youtube = request.data.get("youtube", "")
        config.email = request.data.get("email", "")
        config.insta = request.data.get("insta", "")
        config.facebook = request.data.get("facebook", "")
        config.save()
        return Response({"status": "success", "message": "Social links updated successfully"})
    return Response({
        "twitter": config.twitter,
        "youtube": config.youtube,
        "email": config.email,
        "insta": config.insta,
        "facebook": config.facebook,
    })

# --- BLOG ENDPOINTS WITH SCHEDULED FILTERING & BASE64 STORAGE ---

@api_view(["GET"])
@permission_classes([AllowAny])
def get_blogs(request):
    from .models import BlogPost
    now = timezone.now()
    
    # Filter active blogs: posted 'now' OR scheduled for a time that has already passed
    blogs = BlogPost.objects.filter(is_active=True).filter(
        models.Q(publish_option="now") | models.Q(publish_option="schedule", scheduled_for__lte=now)
    ).order_by("-id")
    
    data = []
    for b in blogs:
        data.append({
            "id": b.id,
            "title": b.title,
            "description": b.description,
            "image_url": b.image_data or "",
            "publish_option": b.publish_option,
            "scheduled_for": b.scheduled_for.strftime("%Y-%m-%d %H:%M") if b.scheduled_for else "",
            "created_at": b.created_at.strftime("%Y-%m-%d %H:%M"),
        })
    return Response({"blogs": data})

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def admin_manage_blogs(request):
    from .models import BlogPost
    
    if request.method == "POST":
        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        publish_option = request.data.get("publish_option", "now")
        
        scheduled_for_str = request.data.get("scheduled_for")
        scheduled_for = parse_datetime(scheduled_for_str) if scheduled_for_str else None
        
        image_file = request.FILES.get("image")
        
        if not title or not description:
            return Response({"error": "Title and description are required."}, status=400)
            
        image_data_str = ""
        if image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            content_type = image_file.content_type or "image/jpeg"
            image_data_str = f"data:{content_type};base64,{encoded_string}"
            
        blog = BlogPost.objects.create(
            title=title,
            description=description,
            publish_option=publish_option,
            scheduled_for=scheduled_for if publish_option == "schedule" else None,
            image_data=image_data_str
        )
        return Response({
            "status": "success",
            "blog": {
                "id": blog.id,
                "title": blog.title,
                "description": blog.description,
                "image_url": blog.image_data,
                "publish_option": blog.publish_option,
                "scheduled_for": blog.scheduled_for.strftime("%Y-%m-%d %H:%M") if blog.scheduled_for else "",
                "created_at": blog.created_at.strftime("%Y-%m-%d %H:%M")
            }
        })
        
    blogs = BlogPost.objects.all().order_by("-id")
    data = [{
        "id": b.id,
        "title": b.title,
        "description": b.description,
        "image_url": b.image_data or "",
        "publish_option": b.publish_option,
        "scheduled_for": b.scheduled_for.strftime("%Y-%m-%d %H:%M") if b.scheduled_for else "",
        "created_at": b.created_at.strftime("%Y-%m-%d %H:%M"),
        "is_active": b.is_active
    } for b in blogs]
    return Response({"blogs": data})

@api_view(["PUT", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def admin_modify_blog(request, blog_id):
    from .models import BlogPost
    try:
        blog = BlogPost.objects.get(id=blog_id)
    except BlogPost.DoesNotExist:
        return Response({"error": "Blog not found."}, status=404)
        
    if request.method == "DELETE":
        blog.delete()
        return Response({"status": "success", "message": "Blog deleted successfully."})
        
    elif request.method == "PUT":
        title = request.data.get("title", "").strip()
        description = request.data.get("description", "").strip()
        publish_option = request.data.get("publish_option", "now")
        
        scheduled_for_str = request.data.get("scheduled_for")
        scheduled_for = parse_datetime(scheduled_for_str) if scheduled_for_str else None
        
        image_file = request.FILES.get("image")
        
        if not title or not description:
            return Response({"error": "Title and description are required."}, status=400)
            
        blog.title = title
        blog.description = description
        blog.publish_option = publish_option
        blog.scheduled_for = scheduled_for if publish_option == "schedule" else None
        
        if image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            content_type = image_file.content_type or "image/jpeg"
            blog.image_data = f"data:{content_type};base64,{encoded_string}"
            
        blog.save()
        return Response({
            "status": "success",
            "blog": {
                "id": blog.id,
                "title": blog.title,
                "description": blog.description,
                "image_url": blog.image_data,
                "publish_option": blog.publish_option,
                "scheduled_for": blog.scheduled_for.strftime("%Y-%m-%d %H:%M") if blog.scheduled_for else "",
                "created_at": blog.created_at.strftime("%Y-%m-%d %H:%M")
            }
        })