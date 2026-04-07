from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from accounts.permissions import IsAdmin
from .models import Store
from .serializers import StoreSerializer


class StoreSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'PATCH':
            return [IsAdmin()]
        from rest_framework.permissions import IsAuthenticated
        return [IsAuthenticated()]

    def get(self, request):
        store = Store.objects.first()
        if not store:
            return Response({})
        return Response(StoreSerializer(store).data)

    def patch(self, request):
        store = Store.objects.first()
        if not store:
            store = Store()
        serializer = StoreSerializer(store, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
