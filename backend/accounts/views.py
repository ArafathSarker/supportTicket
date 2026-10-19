from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.contrib.auth.models import User  # noqa: F401 (explicit for clarity)

from .models import Company
from .serializers import CompanySerializer, UserSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CompanyListView(generics.ListAPIView):
    """Company dropdown source for super admins (visiting log workflow)."""

    queryset = Company.objects.all().order_by('name')
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
