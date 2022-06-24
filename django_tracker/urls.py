from django.urls import path, re_path
from . import views
#from knox import views as knox_views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('purchasecategory/', views.PurchaseCategoryListView.as_view()),
    path('purchasecategory/<int:pk>/', views.PurchaseCategoryDetailView.as_view()),
    path('transactions/', views.TransactionsListView.as_view()),
    path('transactions/<int:pk>/', views.TransactionsDetailView.as_view()),
    path('transactionTax/', views.TransactTaxListView.as_view()),
    path('transactionTax/<int:pk>/', views.TransactTaxDetailView.as_view()),
    path('purchases/', views.PurchasesListView.as_view()),
    path('purchases/<int:pk>/', views.PurchasesDetailView.as_view()),
    path('users/', views.AuthUserView.as_view()),
    path('taxcategory/', views.TaxCategoryListView.as_view()),
    path('taxcategory/<int:pk>/', views.TaxCategoryDetailView.as_view()),
    #path('taxCategory/<int:transact_id>/<int:tax_id>/', views.TaxCategoryListView.as_view())
    path('budget/', views.BudgetListView.as_view()),
    path('budget/<int:pk>/', views.BudgetDetailView.as_view()),
    path('budgetLimits/', views.BudgetLimitListView.as_view()),
    path('budgetLimits/<int:pk>/', views.BudgetLimitDetailView.as_view()),
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('', views.getRoutes)
    #path(r'login/', views.LoginView.as_view(), name='knox_login'),
    #path(r'logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
    #path(r'logoutall/', knox_views.LogoutAllView.as_view(), name='knox_logoutall'),
]