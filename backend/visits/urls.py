from django.urls import path

from .views import VisitingLogDetailView, VisitingLogListCreateView

urlpatterns = [
    path(
        'visiting-logs/',
        VisitingLogListCreateView.as_view(),
        name='visiting-logs',
    ),
    path(
        'visiting-logs/<int:pk>/',
        VisitingLogDetailView.as_view(),
        name='visiting-log-detail',
    ),
]
