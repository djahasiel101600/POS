from rest_framework import serializers
from .models import Sale, SaleItem, Payment


class SaleItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    line_discount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)


class SaleCreateSerializer(serializers.Serializer):
    items = SaleItemInputSerializer(many=True)
    payment_method = serializers.ChoiceField(choices=['cash', 'gcash', 'card', 'bank_transfer', 'other'])
    cash_received = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = serializers.CharField(required=False, allow_blank=True)
    reference_number = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data.get('payment_method') == 'cash':
            if not data.get('cash_received'):
                raise serializers.ValidationError('cash_received is required for cash payments.')
        return data


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'payment_method', 'amount', 'reference_number', 'created_at']


class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'product_name_snapshot', 'unit_price',
            'quantity', 'line_discount', 'line_total',
        ]


class SaleListSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.full_name', read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            'id', 'receipt_number', 'cashier', 'cashier_name',
            'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
            'payment_method', 'status', 'item_count', 'created_at',
        ]

    def get_item_count(self, obj):
        return obj.items.count()


class SaleDetailSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.full_name', read_only=True)
    items = SaleItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'receipt_number', 'cashier', 'cashier_name',
            'subtotal', 'discount_amount', 'tax_amount', 'total_amount',
            'payment_method', 'cash_received', 'change_amount',
            'status', 'notes', 'items', 'payments',
            'voided_by', 'voided_at', 'created_at',
        ]
