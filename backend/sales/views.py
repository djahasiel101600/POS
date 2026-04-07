from decimal import Decimal
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Sale
from .serializers import SaleListSerializer, SaleDetailSerializer, SaleCreateSerializer
from .selectors import get_sales, get_sale_by_id
from .services import create_sale, void_sale
from .permissions import SalePermission, VoidSalePermission
from common.exceptions import InsufficientStockError, InvalidOperationError


class SaleListCreateView(generics.ListCreateAPIView):
    permission_classes = [SalePermission]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SaleCreateSerializer
        return SaleListSerializer

    def get_queryset(self):
        params = self.request.query_params
        return get_sales(
            cashier_id=params.get('cashier'),
            status=params.get('status'),
            payment_method=params.get('payment_method'),
            date_from=params.get('date_from'),
            date_to=params.get('date_to'),
        )

    def create(self, request, *args, **kwargs):
        serializer = SaleCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            sale = create_sale(
                items_data=data['items'],
                payment_method=data['payment_method'],
                cashier=request.user,
                discount_amount=data.get('discount_amount', Decimal('0')),
                cash_received=data.get('cash_received'),
                notes=data.get('notes', ''),
                reference_number=data.get('reference_number', ''),
            )
        except (InsufficientStockError, InvalidOperationError) as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(SaleDetailSerializer(sale).data, status=status.HTTP_201_CREATED)


class SaleDetailView(generics.RetrieveAPIView):
    permission_classes = [SalePermission]
    serializer_class = SaleDetailSerializer

    def get_object(self):
        return get_sale_by_id(self.kwargs['pk'])


class VoidSaleView(APIView):
    permission_classes = [VoidSalePermission]

    def post(self, request, pk):
        try:
            sale = get_sale_by_id(pk)
            sale = void_sale(sale, request.user)
        except InvalidOperationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(SaleDetailSerializer(sale).data)


class ReceiptView(APIView):
    permission_classes = [SalePermission]

    def get(self, request, pk):
        sale = get_sale_by_id(pk)
        try:
            from settings_app.models import Store
            store = Store.objects.first()
            store_data = {
                'store_name': store.store_name if store else '',
                'address': store.address if store else '',
                'contact_number': store.contact_number if store else '',
                'receipt_header': store.receipt_header if store else '',
                'receipt_footer': store.receipt_footer if store else '',
            }
        except Exception:
            store_data = {}

        receipt = {
            'store': store_data,
            'receipt_number': sale.receipt_number,
            'cashier': sale.cashier.full_name,
            'created_at': sale.created_at,
            'items': [
                {
                    'name': item.product_name_snapshot,
                    'unit_price': str(item.unit_price),
                    'quantity': item.quantity,
                    'line_discount': str(item.line_discount),
                    'line_total': str(item.line_total),
                }
                for item in sale.items.all()
            ],
            'subtotal': str(sale.subtotal),
            'discount_amount': str(sale.discount_amount),
            'tax_amount': str(sale.tax_amount),
            'total_amount': str(sale.total_amount),
            'payment_method': sale.payment_method,
            'cash_received': str(sale.cash_received) if sale.cash_received else None,
            'change_amount': str(sale.change_amount) if sale.change_amount else None,
            'status': sale.status,
        }
        return Response(receipt)
