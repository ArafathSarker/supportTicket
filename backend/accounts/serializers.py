from django.contrib.auth.models import User

from rest_framework import serializers

from .models import Company, Profile


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'contact_email', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    company = serializers.PrimaryKeyRelatedField(
        source='profile.company', read_only=True
    )
    company_name = serializers.CharField(
        source='profile.company.name', read_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'company', 'company_name']
