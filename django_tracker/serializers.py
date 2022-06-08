from questionary import password
from rest_framework import serializers
from . import models
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        
        return token


class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        fields = (
            'id',
            'username',
            'email'
        )
        model = User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('id','username','password','password2')
        #extra_kwargs={'password':{'write-only':True}}
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields don't match"})
        return attrs
    
    def create(self, validated_data):
        #user = User.objects.create_user(validated_data['username'], validated_data['email'], validated_data['password'])
        #return user
        user = User.objects.create(username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()

        return user
        


# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField()
#     password = serializers.CharField()
    
#     def validate(self, data):
#         user = authenticate(**data)
#         if user and user.is_active:
#             return user
#         return serializers.ValidationError('Incorrect Credentials Passed')


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

