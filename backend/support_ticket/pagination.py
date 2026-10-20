"""Self-contained pagination so list endpoints don't rely on host DRF settings."""
from django.conf import settings

from rest_framework.pagination import PageNumberPagination

from .conf import setting


class SupportPagination(PageNumberPagination):
    page_size = None  # resolved lazily so hosts can override per environment

    def get_page_size(self, request):
        if self.page_size is None:
            self.page_size = setting('PAGE_SIZE')
        return super().get_page_size(request)
