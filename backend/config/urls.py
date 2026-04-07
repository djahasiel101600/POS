from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/products/', include('products.urls')),
    path('api/categories/', include('products.category_urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/users/', include('accounts.user_urls')),
    path('api/settings/', include('settings_app.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
