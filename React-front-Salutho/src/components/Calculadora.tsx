import React, { useState } from 'react';
import { Calculator, AlertCircle, CheckCircle2, Loader2, Zap, Clock, Target } from 'lucide-react';

interface ResultadoCalculo {
  resultado: number;
  intervalo: string;
  tempo_calculo?: number;
}

interface RespostaErro {
  erro: string;
  detalhes?: string;
}

const Calculadora: React.FC = () => {
  const [valorX, setValorX] = useState<string>('');
  const [valorY, setValorY] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [erro, setErro] = useState<string>('');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [errosValidacao, setErrosValidacao] = useState<{x?: string; y?: string}>({});

  const validarEntradas = (): boolean => {
    const erros: {x?: string; y?: string} = {};
    
    // Converter para números
    const numX = parseInt(valorX);
    const numY = parseInt(valorY);
    
    // Verificar se x é um inteiro positivo válido
    if (!valorX || isNaN(numX) || numX <= 0 || !Number.isInteger(Number(valorX))) {
      erros.x = 'X deve ser um número inteiro positivo';
    }
    
    // Verificar se y é um inteiro positivo válido
    if (!valorY || isNaN(numY) || numY <= 0 || !Number.isInteger(Number(valorY))) {
      erros.y = 'Y deve ser um número inteiro positivo';
    }
    
    // Verificar se x < y
    if (!erros.x && !erros.y && numX >= numY) {
      erros.y = 'Y deve ser maior que X';
    }
    
    // Verificar se o intervalo é válido
    if (!erros.x && !erros.y && (numY - numX) <= 0) {
      erros.y = 'O intervalo deve ser maior que zero';
    }
    
    setErrosValidacao(erros);
    return Object.keys(erros).length === 0;
  };

  const lidarComEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarEntradas()) {
      return;
    }
    
    setCarregando(true);
    setErro('');
    setResultado(null);
    
    try {
      const resposta = await fetch('http://localhost:8000/api/calcular-mmc/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: parseInt(valorX),
          y: parseInt(valorY)
        })
      });
      
      const dados = await resposta.json();
      
      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao calcular o resultado');
      }
      
      setResultado(dados);
    } catch (err) {
      if (err instanceof Error) {
        setErro(err.message);
      } else {
        setErro('Erro de conexão. Certifique-se de que o servidor Django está rodando na porta 8000.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const formatarNumeroGrande = (numero: number): string => {
    // Para números extremamente grandes, usar notação científica
    if (numero >= 1e12) {
      return numero.toExponential(3);
    }
    // Para números grandes, usar separadores de milhares
    if (numero >= 1e6) {
      return numero.toLocaleString('pt-BR');
    }
    // Para números menores, usar formatação normal
    return numero.toLocaleString('pt-BR');
  };

  const lidarComMudancaEntrada = (definidor: React.Dispatch<React.SetStateAction<string>>, campo: 'x' | 'y') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    definidor(valor);
    
    // Limpar erro de validação quando o usuário começa a digitar
    if (errosValidacao[campo]) {
      setErrosValidacao(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg hover-lift">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
            Salutho-Desafio
          </h1>
          <p className="text-gray-600 text-lg font-medium">Calculadora de Mínimo Múltiplo Comum</p>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-gray-500">
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={lidarComEnvio} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="valorX" className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Inicial (X)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="valorX"
                  value={valorX}
                  onChange={lidarComMudancaEntrada(setValorX, 'x')}
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                    errosValidacao.x 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'
                  }`}
                  placeholder="Ex: 1"
                  disabled={carregando}
                />
                {errosValidacao.x && (
                  <div className="flex items-center mt-2 text-red-600 text-sm animate-pulse">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errosValidacao.x}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="valorY" className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Final (Y)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="valorY"
                  value={valorY}
                  onChange={lidarComMudancaEntrada(setValorY, 'y')}
                  className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                    errosValidacao.y 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'
                  }`}
                  placeholder="Ex: 10"
                  disabled={carregando}
                />
                {errosValidacao.y && (
                  <div className="flex items-center mt-2 text-red-600 text-sm animate-pulse">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errosValidacao.y}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {carregando ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                <span className="text-lg">Calculando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Calculator className="w-5 h-5 mr-2" />
                <span className="text-lg">Calcular MMC</span>
              </div>
            )}
          </button>
        </form>

        {/* Erro Display */}
        {erro && (
          <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl animate-in slide-in-from-top-2">
            <div className="flex items-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-red-800">Erro na Operação</h3>
            </div>
            <p className="text-red-700 leading-relaxed">{erro}</p>
          </div>
        )}

        {/* Resultado Display */}
        {resultado && (
          <div className="mt-6 p-8 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800">Resultado Calculado</h3>
                <p className="text-green-600">Operação concluída com sucesso</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-semibold text-gray-700">Intervalo:</span>
                </div>
                <span className="text-lg font-bold text-green-700">{resultado.intervalo}</span>
              </div>
              
                             <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                 <div className="text-center">
                   <p className="text-sm font-medium opacity-90 mb-2">Menor Múltiplo Comum</p>
                   <div className="break-all">
                     <p className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                       {formatarNumeroGrande(resultado.resultado)}
                     </p>
                   </div>
                   {resultado.resultado >= 1e12 && (
                     <p className="text-xs opacity-75 mt-2">
                       * Resultado em notação científica devido ao tamanho
                     </p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Exemplo de Teste*/}
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Exemplo de Teste
          </h4>
          <p className="text-gray-600 leading-relaxed">
            Para o intervalo de <span className="font-bold text-blue-600">1 a 10</span>, 
            o resultado esperado é <span className="font-bold text-green-600">2520</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calculadora;