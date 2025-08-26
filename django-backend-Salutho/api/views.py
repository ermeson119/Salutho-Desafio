import time
import math
from functools import reduce
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import json


def mdc(a, b):
    """Calcula o Máximo Divisor Comum usando o algoritmo de Euclides"""
    while b:
        a, b = b, a % b
    return a


def mmc(a, b):
    """Calcula o Mínimo Múltiplo Comum"""
    return abs(a * b) // mdc(a, b)


def mmc_intervalo(x, y):
    """Calcula o MMC de todos os números no intervalo [x, y]"""
    if x > y:
        raise ValueError("x deve ser menor que y")
    
    if x <= 0 or y <= 0:
        raise ValueError("Ambos os números devem ser positivos")
    
    # Começar com o primeiro número
    resultado = x
    
    # Calcular MMC com cada número subsequente
    for i in range(x + 1, y + 1):
        resultado = mmc(resultado, i)
    
    return resultado


@api_view(['POST'])
@permission_classes([AllowAny])
def calcular_mmc(request):
    """
    Endpoint da API para calcular o MMC de todos os números em um intervalo dado
    """
    try:
        dados = request.data
        
        # Validar entrada
        if 'x' not in dados or 'y' not in dados:
            return Response({
                'erro': 'Parâmetros x e y são obrigatórios',
                'detalhes': 'Envie um JSON com os campos x e y'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        x = dados['x']
        y = dados['y']
        
        # Validar tipos e valores
        if not isinstance(x, int) or not isinstance(y, int):
            return Response({
                'erro': 'x e y devem ser números inteiros',
                'detalhes': f'Recebido: x={type(x).__name__}, y={type(y).__name__}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if x <= 0 or y <= 0:
            return Response({
                'erro': 'x e y devem ser números positivos',
                'detalhes': f'Recebido: x={x}, y={y}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if x >= y:
            return Response({
                'erro': 'x deve ser menor que y',
                'detalhes': f'Recebido: x={x}, y={y}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar intervalo razoável para evitar problemas de performance
        if (y - x) > 50:
            return Response({
                'erro': 'Intervalo muito grande',
                'detalhes': 'Por favor, use um intervalo menor que 50 números para evitar problemas de performance'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Iniciar cronômetro
        tempo_inicio = time.time()
        
        # Calcular MMC
        resultado = mmc_intervalo(x, y)
        
        # Finalizar cronômetro
        tempo_fim = time.time()
        tempo_calculo = tempo_fim - tempo_inicio
        
        return Response({
            'resultado': resultado,
            'intervalo': f'{x} a {y}',
            'tempo_calculo': tempo_calculo,
            'mensagem': f'MMC de todos os números no intervalo [{x}, {y}] calculado com sucesso'
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response({
            'erro': 'Erro de validação',
            'detalhes': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'erro': 'Erro interno do servidor',
            'detalhes': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)