from rest_framework import serializers
from . import models

class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'username',
            'password',
            'email'
        )
        model = models.AuthUser


class PurchaseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.PurchaseCategory


class TaxCategorySerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.TaxCategory


class TransactionsSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Transactions


class TransactTaxSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.TransactTax


class PurchasesSerializer(serializers.ModelSerializer):
    class Meta:
        fields = '__all__'
        model = models.Purchases

