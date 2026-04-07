from django.urls import path
from . import views

urlpatterns = [
    path('store/', views.StoreSettingsView.as_view(), name='settings-store'),
]
