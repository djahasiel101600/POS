from django.urls import path
from . import user_views

urlpatterns = [
    path('', user_views.UserListCreateView.as_view(), name='user-list-create'),
    path('<int:pk>/', user_views.UserDetailUpdateView.as_view(), name='user-detail-update'),
    path('<int:pk>/reset-password/', user_views.UserResetPasswordView.as_view(), name='user-reset-password'),
]
