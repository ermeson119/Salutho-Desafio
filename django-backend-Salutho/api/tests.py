from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import json


class TesteCalculoMMC(APITestCase):
    
    def setUp(self):
        self.url = reverse('calcular_mmc')
    
    def test_calculo_valido(self):
        """Teste de cálculo MMC válido"""
        dados = {'x': 1, 'y': 10}
        resposta = self.client.post(self.url, dados, format='json')
        
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data['resultado'], 2520)
        self.assertEqual(resposta.data['intervalo'], '1 a 10')
        self.assertIn('tempo_calculo', resposta.data)
    
    def test_outro_calculo_valido(self):
        """Teste de outro cálculo MMC válido"""
        dados = {'x': 1, 'y': 5}
        resposta = self.client.post(self.url, dados, format='json')
        
        self.assertEqual(resposta.status_code, status.HTTP_200_OK)
        self.assertEqual(resposta.data['resultado'], 60)  # MMC de 1,2,3,4,5
    
    def test_parametros_faltando(self):
        """Teste de parâmetros faltando"""
        dados = {'x': 1}
        resposta = self.client.post(self.url, dados, format='json')
        
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('erro', resposta.data)
    
    def test_tipos_invalidos(self):
        """Teste de tipos de parâmetros inválidos"""
        dados = {'x': '1', 'y': 10}
        resposta = self.client.post(self.url, dados, format='json')
        
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('erro', resposta.data)
    
    def test_numeros_negativos(self):
        """Teste de números negativos"""
        dados = {'x': -1, 'y': 5}
        resposta = self.client.post(self.url, dados, format='json')
        
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('erro', resposta.data)
    
    def test_x_maior_que_y(self):
        """Teste de x maior que y"""
        dados = {'x': 10, 'y': 1}
        resposta = self.client.post(self.url, dados, format='json')
        
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('erro', resposta.data)
    
    def test_intervalo_grande(self):
        """Teste de intervalo grande (deve ser rejeitado)"""
        dados = {'x': 1, 'y': 100}
        resposta = self.client.post(self.url, dados, format='json')
        
        self.assertEqual(resposta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('erro', resposta.data)