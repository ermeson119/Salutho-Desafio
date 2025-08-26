from django.urls import path
from . import views

urlpatterns = [
    path('calcular-mmc/', views.calcular_mmc, name='calcular_mmc'),
]