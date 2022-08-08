from . import models
from . import serializers
from rest_framework import generics
from rest_framework import status
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django_filters import rest_framework as filters

# Auth
from django.contrib.auth import login
from django.contrib.auth.models import User

from rest_framework import permissions
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated

http_method_names = ['get', 'head']


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = serializers.MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = serializers.RegisterSerializer


class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UpdateUserSerializer
    permission_classes = (IsAuthenticated,)
    def get_object(self):
        return self.request.user


class UpdateUsernameView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UpdateUsernameSerializer
    permission_classes = (IsAuthenticated,)
    def get_object(self):
        return self.request.user


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/',
        '/api/updateUser/'
    ]
    return Response(routes)


class PurchaseCategoryListView(generics.ListCreateAPIView):
    serializer_class = serializers.PurchaseCategorySerializer
    
    def get_queryset(self):
        user = self.request.user.id
        return models.PurchaseCategory.objects.filter(user=user)


class PurchaseCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset=models.PurchaseCategory.objects.all()
    serializer_class = serializers.PurchaseCategorySerializer


class AuthUserView(generics.CreateAPIView):
    queryset = models.AuthUser.objects.all()
    serializer_class = serializers.AuthUserSerializer


class TaxCategoryListView(generics.ListCreateAPIView):
    serializer_class = serializers.TaxCategorySerializer
    def get_queryset(self):
        user = self.request.user.id
        return models.TaxCategory.objects.filter(user=user)


class TaxCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.TaxCategory.objects.all()
    serializer_class = serializers.TaxCategorySerializer


class TransactTaxListView(generics.ListCreateAPIView):
    serializer_class = serializers.TransactTaxSerializer
    filter_backends=(filters.DjangoFilterBackend,)
    filterset_fields=('tax', 'transact')
    def get_queryset(self):
        user = self.request.user.id
        return models.TransactTax.objects.filter(user=user)


class TransactTaxDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.TransactTax.objects.all()
    serializer_class = serializers.TransactTaxSerializer


class TransactionsListView(generics.ListCreateAPIView):
    queryset = models.Transactions.objects.all()
    serializer_class = serializers.TransactionsSerializer
    def get_queryset(self):
        user = self.request.user.id
        return models.Transactions.objects.filter(user=user)
    

class TransactionsDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Transactions.objects.all()
    serializer_class = serializers.TransactionsSerializer


class PurchasesListView(generics.ListCreateAPIView):
    queryset = models.Purchases.objects.all()
    serializer_class = serializers.PurchasesSerializer
    def get_queryset(self):
        user = self.request.user.id
        transactions = models.Transactions.objects.filter(user=user)
        return models.Purchases.objects.filter(transact__in=transactions)


class PurchasesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Purchases.objects.all()
    serializer_class = serializers.PurchasesSerializer
    

class BudgetListView(generics.ListCreateAPIView):
    serializer_class = serializers.BudgetSerializer
    def get_queryset(self):
        user = self.request.user.id
        return models.Budget.objects.filter(user=user)


class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.Budget.objects.all()
    serializer_class = serializers.BudgetSerializer


class BudgetLimitListView(generics.ListCreateAPIView):
    serializer_class = serializers.BudgetLimitSerializer
    def get_queryset(self):
        user = self.request.user.id
        budgets = models.Budget.objects.filter(user=user)
        purc_categories = models.PurchaseCategory.objects.filter(user=user)
        queryset = models.BudgetLimits.objects.filter(budget__in=budgets).filter(purc_category__in=purc_categories)
        return queryset


class BudgetLimitDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = models.BudgetLimits.objects.all()
    serializer_class = serializers.BudgetLimitSerializer


class BudgetIncomeView(generics.ListCreateAPIView):
    serializer_class = serializers.BudgetIncomeSerializer
    def get_queryset(self):
        user = self.request.user.id
        budgets = models.Budget.objects.filter(user=user)
        queryset = models.BudgetIncomes.objects.filter(budget__in=budgets)
        return queryset