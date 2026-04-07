from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import User
from .serializers import UserDetailSerializer, UserCreateSerializer, UserUpdateSerializer, PasswordResetSerializer
from .selectors import get_all_users, get_user_by_id
from .services import create_user, update_user, reset_password
from .permissions import IsAdmin


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserDetailSerializer

    def get_queryset(self):
        return get_all_users(
            role=self.request.query_params.get('role'),
            is_active=self.request.query_params.get('is_active'),
        )


class UserDetailUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdmin]
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return UserUpdateSerializer
        return UserDetailSerializer


class UserResetPasswordView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        user = get_user_by_id(pk)
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset_password(user, serializer.validated_data['new_password'])
        return Response({'detail': 'Password reset successfully.'})
