from django.urls import path, re_path
from . import views
from knox import views as knox_views

urlpatterns = [
    path('purchasecategory/', views.PurchaseCategoryView.as_view()),
    path('transactions/', views.TransactionsView.as_view()),
    path('transactionTax/', views.TransactTaxView.as_view()),
    path('purchases/', views.PurchasesView.as_view()),
    path('users/', views.AuthUserView.as_view()),
    path('taxcategory/', views.TaxCategoryView.as_view()),
    path(r'login/', views.LoginView.as_view(), name='knox_login'),
    path(r'logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    path(r'logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
]